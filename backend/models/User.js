const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email обязателен"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Пожалуйста, введите корректный email",
      ],
    },
    password: {
      type: String,
      required: [true, "Пароль обязателен"],
      minlength: [6, "Пароль должен содержать минимум 6 символов"],
      select: false, // По умолчанию не включать пароль в запросы
    },
    firstName: {
      type: String,
      required: [true, "Имя обязательно"],
      trim: true,
      maxlength: [50, "Имя не может быть длиннее 50 символов"],
    },
    lastName: {
      type: String,
      required: [true, "Фамилия обязательна"],
      trim: true,
      maxlength: [50, "Фамилия не может быть длиннее 50 символов"],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        "Пожалуйста, введите корректный номер телефона",
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    profile: {
      avatar: String,
      birthDate: Date,
      address: {
        city: String,
        street: String,
        zipCode: String,
      },
      preferences: {
        newsletter: {
          type: Boolean,
          default: true,
        },
        notifications: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Виртуальное поле для полного имени
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Виртуальное поле для проверки блокировки аккаунта
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Индексы для оптимизации поиска
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });

// Middleware для хеширования пароля перед сохранением
userSchema.pre("save", async function (next) {
  // Хешировать пароль только если он был изменен
  if (!this.isModified("password")) return next();

  try {
    // Хеширование пароля с salt rounds = 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Метод для увеличения счетчика неудачных попыток входа
userSchema.methods.incLoginAttempts = function () {
  // Если есть предыдущая блокировка и она истекла
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Если достигли максимума попыток и аккаунт не заблокирован, заблокировать его
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000, // блокировка на 2 часа
    };
  }

  return this.updateOne(updates);
};

// Метод для сброса счетчика попыток входа
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Метод для получения публичной информации о пользователе
userSchema.methods.toPublicJSON = function () {
  const userObject = this.toObject();

  // Удаляем приватные поля
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  delete userObject.__v;

  return userObject;
};

// Статический метод для поиска пользователя по email без учета регистра
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Статический метод для получения статистики пользователей
userSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
      },
    },
  ]);
};

module.exports = mongoose.model("User", userSchema);
