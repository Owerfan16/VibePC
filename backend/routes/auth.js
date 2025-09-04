const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const {
  generateToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  refreshAccessToken,
  authenticate,
} = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
  validateEmailVerification,
  sanitizeInput,
} = require("../middleware/validation");

const router = express.Router();

// Регистрация нового пользователя
router.post(
  "/register",
  sanitizeInput,
  validateRegistration,
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Проверка существования пользователя
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "Пользователь с таким email уже существует",
        });
      }

      // Создание нового пользователя
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        emailVerificationToken: crypto.randomBytes(32).toString("hex"),
      });

      await user.save();

      // Генерация токенов
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Установка токенов в cookies
      setTokenCookies(res, accessToken, refreshToken);

      res.status(201).json({
        status: "success",
        message: "Пользователь успешно зарегистрирован",
        data: {
          user: user.toPublicJSON(),
          accessToken,
        },
      });
    } catch (error) {
      console.error("Ошибка регистрации:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          status: "error",
          message: "Пользователь с таким email уже существует",
        });
      }

      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при регистрации",
      });
    }
  }
);

// Вход в систему
router.post("/login", sanitizeInput, validateLogin, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Поиск пользователя с паролем
    const user = await User.findByEmail(email).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Неверный email или пароль",
      });
    }

    // Проверка блокировки аккаунта
    if (user.isLocked) {
      return res.status(423).json({
        status: "error",
        message:
          "Аккаунт временно заблокирован из-за множественных неудачных попыток входа",
      });
    }

    // Проверка активности аккаунта
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Аккаунт деактивирован",
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Увеличение счетчика неудачных попыток
      await user.incLoginAttempts();

      return res.status(401).json({
        status: "error",
        message: "Неверный email или пароль",
      });
    }

    // Сброс счетчика попыток при успешном входе
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Обновление времени последнего входа
    user.lastLogin = new Date();
    await user.save();

    // Генерация токенов
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Установка токенов в cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      status: "success",
      message: "Успешный вход в систему",
      data: {
        user: user.toPublicJSON(),
        accessToken,
      },
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при входе",
    });
  }
});

// Выход из системы
router.post("/logout", authenticate, async (req, res) => {
  try {
    // Очистка токенов из cookies
    clearTokenCookies(res);

    res.json({
      status: "success",
      message: "Успешный выход из системы",
    });
  } catch (error) {
    console.error("Ошибка выхода:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при выходе",
    });
  }
});

// Обновление токена доступа
router.post("/refresh-token", refreshAccessToken);

// Получение текущего пользователя
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      status: "success",
      data: {
        user: req.user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при получении данных пользователя",
    });
  }
});

// Запрос сброса пароля
router.post(
  "/forgot-password",
  sanitizeInput,
  validatePasswordReset,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);

      if (!user) {
        // Не сообщаем, что пользователь не найден из соображений безопасности
        return res.json({
          status: "success",
          message:
            "Если пользователь с таким email существует, инструкции по сбросу пароля будут отправлены на него",
        });
      }

      // Генерация токена сброса пароля
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 минут

      await user.save();

      // TODO: Отправка email с токеном сброса
      console.log(`Токен сброса пароля для ${email}: ${resetToken}`);

      res.json({
        status: "success",
        message:
          "Если пользователь с таким email существует, инструкции по сбросу пароля будут отправлены на него",
      });
    } catch (error) {
      console.error("Ошибка сброса пароля:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при сбросе пароля",
      });
    }
  }
);

// Сброс пароля
router.post(
  "/reset-password",
  sanitizeInput,
  validateNewPassword,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      // Хеширование токена
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Поиск пользователя по токену
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Недействительный или истекший токен сброса пароля",
        });
      }

      // Установка нового пароля
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      // Сброс попыток входа
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      res.json({
        status: "success",
        message: "Пароль успешно изменен",
      });
    } catch (error) {
      console.error("Ошибка установки нового пароля:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при установке нового пароля",
      });
    }
  }
);

// Верификация email
router.post(
  "/verify-email",
  sanitizeInput,
  validateEmailVerification,
  async (req, res) => {
    try {
      const { token } = req.body;

      const user = await User.findOne({ emailVerificationToken: token });

      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Недействительный токен верификации",
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      res.json({
        status: "success",
        message: "Email успешно подтвержден",
      });
    } catch (error) {
      console.error("Ошибка верификации email:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при верификации email",
      });
    }
  }
);

// Повторная отправка токена верификации
router.post("/resend-verification", authenticate, async (req, res) => {
  try {
    const user = req.user;

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: "error",
        message: "Email уже подтвержден",
      });
    }

    // Генерация нового токена
    user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
    await user.save();

    // TODO: Отправка email с новым токеном
    console.log(
      `Новый токен верификации для ${user.email}: ${user.emailVerificationToken}`
    );

    res.json({
      status: "success",
      message: "Новая ссылка для подтверждения email отправлена",
    });
  } catch (error) {
    console.error("Ошибка повторной отправки верификации:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при повторной отправке верификации",
    });
  }
});

// Проверка доступности email
router.post("/check-email", sanitizeInput, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email обязателен",
      });
    }

    const user = await User.findByEmail(email);

    res.json({
      status: "success",
      data: {
        available: !user,
      },
    });
  } catch (error) {
    console.error("Ошибка проверки email:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при проверке email",
    });
  }
});

module.exports = router;
