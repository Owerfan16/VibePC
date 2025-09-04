const { body, validationResult } = require("express-validator");

// Обработчик результатов валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      status: "error",
      message: "Ошибки валидации данных",
      errors: formattedErrors,
    });
  }

  next();
};

// Валидация регистрации
const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Пожалуйста, введите корректный email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен содержать минимум 6 символов")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Пароли не совпадают");
    }
    return true;
  }),

  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Имя должно содержать от 2 до 50 символов")
    .matches(/^[а-яёА-ЯЁa-zA-Z\s-]+$/)
    .withMessage("Имя может содержать только буквы, пробелы и дефисы"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Фамилия должна содержать от 2 до 50 символов")
    .matches(/^[а-яёА-ЯЁa-zA-Z\s-]+$/)
    .withMessage("Фамилия может содержать только буквы, пробелы и дефисы"),

  body("phone")
    .optional()
    .isMobilePhone("ru-RU")
    .withMessage("Пожалуйста, введите корректный номер телефона"),

  body("terms")
    .equals("true")
    .withMessage("Необходимо принять пользовательское соглашение"),

  handleValidationErrors,
];

// Валидация входа
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Пожалуйста, введите корректный email"),

  body("password").notEmpty().withMessage("Пароль обязателен"),

  handleValidationErrors,
];

// Валидация смены пароля
const validatePasswordChange = [
  body("currentPassword").notEmpty().withMessage("Текущий пароль обязателен"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Новый пароль должен содержать минимум 6 символов")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Новый пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру"
    ),

  body("confirmNewPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Новые пароли не совпадают");
    }
    return true;
  }),

  handleValidationErrors,
];

// Валидация сброса пароля
const validatePasswordReset = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Пожалуйста, введите корректный email"),

  handleValidationErrors,
];

// Валидация нового пароля при сбросе
const validateNewPassword = [
  body("token").notEmpty().withMessage("Токен сброса пароля обязателен"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Пароль должен содержать минимум 6 символов")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Пароли не совпадают");
    }
    return true;
  }),

  handleValidationErrors,
];

// Валидация обновления профиля
const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Имя должно содержать от 2 до 50 символов")
    .matches(/^[а-яёА-ЯЁa-zA-Z\s-]+$/)
    .withMessage("Имя может содержать только буквы, пробелы и дефисы"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Фамилия должна содержать от 2 до 50 символов")
    .matches(/^[а-яёА-ЯЁa-zA-Z\s-]+$/)
    .withMessage("Фамилия может содержать только буквы, пробелы и дефисы"),

  body("phone")
    .optional()
    .isMobilePhone("ru-RU")
    .withMessage("Пожалуйста, введите корректный номер телефона"),

  body("profile.birthDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Пожалуйста, введите корректную дату рождения"),

  body("profile.address.city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Название города не может быть длиннее 100 символов"),

  body("profile.address.street")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Адрес улицы не может быть длиннее 200 символов"),

  body("profile.address.zipCode")
    .optional()
    .matches(/^\d{6}$/)
    .withMessage("Почтовый индекс должен содержать 6 цифр"),

  body("profile.preferences.newsletter")
    .optional()
    .isBoolean()
    .withMessage("Настройка рассылки должна быть true или false"),

  body("profile.preferences.notifications")
    .optional()
    .isBoolean()
    .withMessage("Настройка уведомлений должна быть true или false"),

  handleValidationErrors,
];

// Валидация email верификации
const validateEmailVerification = [
  body("token").notEmpty().withMessage("Токен верификации обязателен"),

  handleValidationErrors,
];

// Middleware для санитизации данных
const sanitizeInput = (req, res, next) => {
  // Удаление потенциально опасных символов
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        // Удаление HTML тегов и скриптов
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<[^>]*>/g, "")
          .trim();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitize(req.body);
  }

  next();
};

// Middleware для ограничения размера запроса
const limitRequestSize = (maxSize = "10mb") => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers["content-length"]);
    const maxBytes = parseInt(maxSize) * 1024 * 1024; // Конвертация в байты

    if (contentLength > maxBytes) {
      return res.status(413).json({
        status: "error",
        message: `Размер запроса слишком большой. Максимум: ${maxSize}`,
      });
    }

    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validatePasswordReset,
  validateNewPassword,
  validateProfileUpdate,
  validateEmailVerification,
  sanitizeInput,
  limitRequestSize,
  handleValidationErrors,
};
