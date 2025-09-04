require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// Импорт роутов
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для безопасности
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за 15 минут
  message: {
    error: "Слишком много запросов с этого IP, попробуйте позже.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Более строгий лимит для аутентификации
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа за 15 минут
  message: {
    error: "Слишком много попыток входа, попробуйте позже.",
  },
});

// CORS настройки
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Парсинг JSON и cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vibepc", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Подключено к MongoDB");
  })
  .catch((error) => {
    console.error("❌ Ошибка подключения к MongoDB:", error);
    process.exit(1);
  });

// Роуты API
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);

// Базовый роут для проверки здоровья сервера
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "VibePC Backend API работает",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Обработка несуществующих роутов
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Роут не найден",
  });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
  console.error("❌ Ошибка сервера:", error);

  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Внутренняя ошибка сервера",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 Получен SIGTERM, завершение работы сервера...");
  mongoose.connection.close(() => {
    console.log("🔒 Соединение с MongoDB закрыто");
    process.exit(0);
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📋 API доступно по адресу: http://localhost:${PORT}/api`);
  console.log(`🏥 Проверка здоровья: http://localhost:${PORT}/api/health`);
});

module.exports = app;
