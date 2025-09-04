const express = require("express");
const User = require("../models/User");
const { authenticate, authorize } = require("../middleware/auth");
const {
  validateProfileUpdate,
  validatePasswordChange,
  sanitizeInput,
} = require("../middleware/validation");

const router = express.Router();

// Получение профиля пользователя
router.get("/profile", authenticate, async (req, res) => {
  try {
    res.json({
      status: "success",
      data: {
        user: req.user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error("Ошибка получения профиля:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при получении профиля",
    });
  }
});

// Обновление профиля пользователя
router.put(
  "/profile",
  authenticate,
  sanitizeInput,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const updates = req.body;

      // Список полей, которые можно обновить
      const allowedUpdates = [
        "firstName",
        "lastName",
        "phone",
        "profile.birthDate",
        "profile.address.city",
        "profile.address.street",
        "profile.address.zipCode",
        "profile.preferences.newsletter",
        "profile.preferences.notifications",
      ];

      // Фильтрация обновлений
      const filteredUpdates = {};
      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      // Обработка вложенных объектов профиля
      if (updates.profile) {
        if (updates.profile.address) {
          Object.keys(updates.profile.address).forEach((key) => {
            if (allowedUpdates.includes(`profile.address.${key}`)) {
              filteredUpdates[`profile.address.${key}`] =
                updates.profile.address[key];
            }
          });
        }

        if (updates.profile.preferences) {
          Object.keys(updates.profile.preferences).forEach((key) => {
            if (allowedUpdates.includes(`profile.preferences.${key}`)) {
              filteredUpdates[`profile.preferences.${key}`] =
                updates.profile.preferences[key];
            }
          });
        }

        if (updates.profile.birthDate) {
          filteredUpdates["profile.birthDate"] = updates.profile.birthDate;
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: filteredUpdates },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Пользователь не найден",
        });
      }

      res.json({
        status: "success",
        message: "Профиль успешно обновлен",
        data: {
          user: user.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(400).json({
          status: "error",
          message: "Ошибки валидации",
          errors,
        });
      }

      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при обновлении профиля",
      });
    }
  }
);

// Смена пароля
router.put(
  "/change-password",
  authenticate,
  sanitizeInput,
  validatePasswordChange,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select("+password");

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Пользователь не найден",
        });
      }

      // Проверка текущего пароля
      const isCurrentPasswordValid =
        await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Неверный текущий пароль",
        });
      }

      // Проверка, что новый пароль отличается от текущего
      const isSamePassword = await user.comparePassword(newPassword);
      if (isSamePassword) {
        return res.status(400).json({
          status: "error",
          message: "Новый пароль должен отличаться от текущего",
        });
      }

      // Установка нового пароля
      user.password = newPassword;
      await user.save();

      res.json({
        status: "success",
        message: "Пароль успешно изменен",
      });
    } catch (error) {
      console.error("Ошибка смены пароля:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при смене пароля",
      });
    }
  }
);

// Удаление аккаунта
router.delete("/account", authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Пользователь не найден",
      });
    }

    // Проверка пароля для подтверждения удаления
    if (password) {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Неверный пароль",
        });
      }
    }

    // Деактивация аккаунта вместо полного удаления
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({
      status: "success",
      message: "Аккаунт успешно удален",
    });
  } catch (error) {
    console.error("Ошибка удаления аккаунта:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при удалении аккаунта",
    });
  }
});

// Получение статистики пользователя (только для администраторов)
router.get("/stats", authenticate, authorize("admin"), async (req, res) => {
  try {
    const stats = await User.getStats();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      status: "success",
      data: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        recent: recentUsers,
        byRole: stats,
      },
    });
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    res.status(500).json({
      status: "error",
      message: "Ошибка сервера при получении статистики",
    });
  }
});

// Получение списка пользователей (только для администраторов)
router.get(
  "/list",
  authenticate,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || "";
      const role = req.query.role || "";
      const isActive =
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined;

      // Построение фильтра поиска
      const filter = {};

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      if (role) {
        filter.role = role;
      }

      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      const skip = (page - 1) * limit;

      const users = await User.find(filter)
        .select("-password -emailVerificationToken -passwordResetToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      res.json({
        status: "success",
        data: {
          users: users.map((user) => user.toPublicJSON()),
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers: total,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Ошибка получения списка пользователей:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при получении списка пользователей",
      });
    }
  }
);

// Обновление роли пользователя (только для администраторов)
router.put(
  "/:userId/role",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const validRoles = ["user", "admin", "manager"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          status: "error",
          message: "Недопустимая роль",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Пользователь не найден",
        });
      }

      res.json({
        status: "success",
        message: "Роль пользователя успешно обновлена",
        data: {
          user: user.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error("Ошибка обновления роли:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при обновлении роли",
      });
    }
  }
);

// Блокировка/разблокировка пользователя (только для администраторов)
router.put(
  "/:userId/status",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          status: "error",
          message: "Статус должен быть true или false",
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Пользователь не найден",
        });
      }

      res.json({
        status: "success",
        message: `Пользователь успешно ${isActive ? "активирован" : "деактивирован"}`,
        data: {
          user: user.toPublicJSON(),
        },
      });
    } catch (error) {
      console.error("Ошибка изменения статуса пользователя:", error);
      res.status(500).json({
        status: "error",
        message: "Ошибка сервера при изменении статуса пользователя",
      });
    }
  }
);

module.exports = router;
