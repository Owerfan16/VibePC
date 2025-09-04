const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: "vibepc-api",
      audience: "vibepc-users",
    }
  );
};

// Генерация refresh токена
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET ||
      "your-super-secret-refresh-key-change-in-production",
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
      issuer: "vibepc-api",
      audience: "vibepc-users",
    }
  );
};

// Верификация токена
const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      {
        issuer: "vibepc-api",
        audience: "vibepc-users",
      },
      (error, decoded) => {
        if (error) {
          reject(error);
        } else {
          resolve(decoded);
        }
      }
    );
  });
};

// Middleware для проверки аутентификации
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Проверка токена в заголовке Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Проверка токена в cookies
    else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Токен доступа не предоставлен",
      });
    }

    // Верификация токена
    const decoded = await verifyToken(
      token,
      process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
    );

    // Поиск пользователя
    const user = await User.findById(decoded.userId).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Пользователь не найден",
      });
    }

    // Проверка активности аккаунта
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Аккаунт деактивирован",
      });
    }

    // Проверка блокировки
    if (user.isLocked) {
      return res.status(423).json({
        status: "error",
        message:
          "Аккаунт временно заблокирован из-за множественных неудачных попыток входа",
      });
    }

    // Добавление пользователя в объект запроса
    req.user = user;
    next();
  } catch (error) {
    console.error("Ошибка аутентификации:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Недействительный токен",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Токен истек",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Ошибка сервера при аутентификации",
    });
  }
};

// Middleware для проверки ролей
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Необходима аутентификация",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Недостаточно прав доступа",
      });
    }

    next();
  };
};

// Middleware для опциональной аутентификации (не обязательной)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = await verifyToken(
          token,
          process.env.JWT_SECRET ||
            "your-super-secret-jwt-key-change-in-production"
        );

        const user = await User.findById(decoded.userId);
        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Игнорируем ошибки токена для опциональной аутентификации
        console.log("Опциональная аутентификация не удалась:", error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Функция для установки токенов в cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.COOKIE_DOMAIN || undefined,
  };

  // Access token cookie (короткий срок действия)
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 минут
  });

  // Refresh token cookie (длинный срок действия)
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
  });
};

// Функция для очистки токенов из cookies
const clearTokenCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

// Обновление токена доступа с помощью refresh токена
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Refresh токен не предоставлен",
      });
    }

    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET ||
        "your-super-secret-refresh-key-change-in-production"
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        status: "error",
        message: "Недействительный refresh токен",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || user.isLocked) {
      return res.status(401).json({
        status: "error",
        message: "Пользователь не найден или аккаунт заблокирован",
      });
    }

    // Генерация нового access токена
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Установка новых токенов
    setTokenCookies(res, newAccessToken, newRefreshToken);

    res.json({
      status: "success",
      message: "Токен успешно обновлен",
      data: {
        accessToken: newAccessToken,
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error("Ошибка обновления токена:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        status: "error",
        message: "Недействительный или истекший refresh токен",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Ошибка сервера при обновлении токена",
    });
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  authenticate,
  authorize,
  optionalAuth,
  setTokenCookies,
  clearTokenCookies,
  refreshAccessToken,
};
