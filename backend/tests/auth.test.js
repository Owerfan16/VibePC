const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");

// Настройка тестовой базы данных
const MONGODB_URI =
  process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/vibepc_test";

describe("Authentication Routes", () => {
  let server;

  beforeAll(async () => {
    // Подключение к тестовой базе данных
    await mongoose.connect(MONGODB_URI);
    server = app.listen(0); // Случайный порт
  });

  afterAll(async () => {
    // Очистка и закрытие соединений
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    // Очистка коллекции пользователей перед каждым тестом
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    const validUserData = {
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      firstName: "Тест",
      lastName: "Пользователь",
      phone: "+79001234567",
      terms: true,
    };

    it("должен успешно зарегистрировать пользователя", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.firstName).toBe(validUserData.firstName);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("должен вернуть ошибку при некорректном email", async () => {
      const invalidData = { ...validUserData, email: "invalid-email" };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors).toBeDefined();
    });

    it("должен вернуть ошибку при слабом пароле", async () => {
      const invalidData = {
        ...validUserData,
        password: "123",
        confirmPassword: "123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors).toBeDefined();
    });

    it("должен вернуть ошибку при несовпадающих паролях", async () => {
      const invalidData = {
        ...validUserData,
        confirmPassword: "DifferentPassword123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors).toBeDefined();
    });

    it("должен вернуть ошибку при попытке регистрации существующего пользователя", async () => {
      // Первая регистрация
      await request(app)
        .post("/api/auth/register")
        .send(validUserData)
        .expect(201);

      // Попытка повторной регистрации
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData)
        .expect(409);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("уже существует");
    });

    it("должен вернуть ошибку без принятия пользовательского соглашения", async () => {
      const invalidData = { ...validUserData, terms: false };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    const userData = {
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      firstName: "Тест",
      lastName: "Пользователь",
      terms: true,
    };

    beforeEach(async () => {
      // Создание пользователя для тестов входа
      await request(app).post("/api/auth/register").send(userData);
    });

    it("должен успешно войти в систему", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it("должен вернуть ошибку при неверном пароле", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "WrongPassword123",
        })
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("Неверный");
    });

    it("должен вернуть ошибку при несуществующем email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: userData.password,
        })
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("Неверный");
    });

    it("должен вернуть ошибку при некорректных данных", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: "",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /api/auth/me", () => {
    let accessToken;
    const userData = {
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      firstName: "Тест",
      lastName: "Пользователь",
      terms: true,
    };

    beforeEach(async () => {
      // Регистрация и получение токена
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData);

      accessToken = registerResponse.body.data.accessToken;
    });

    it("должен вернуть данные аутентифицированного пользователя", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("должен вернуть ошибку без токена", async () => {
      const response = await request(app).get("/api/auth/me").expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("токен");
    });

    it("должен вернуть ошибку с недействительным токеном", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("токен");
    });
  });

  describe("POST /api/auth/logout", () => {
    let accessToken;
    const userData = {
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      firstName: "Тест",
      lastName: "Пользователь",
      terms: true,
    };

    beforeEach(async () => {
      // Регистрация и получение токена
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData);

      accessToken = registerResponse.body.data.accessToken;
    });

    it("должен успешно выйти из системы", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("выход");
    });

    it("должен вернуть ошибку без токена", async () => {
      const response = await request(app).post("/api/auth/logout").expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/auth/check-email", () => {
    it("должен вернуть true для доступного email", async () => {
      const response = await request(app)
        .post("/api/auth/check-email")
        .send({ email: "available@example.com" })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.available).toBe(true);
    });

    it("должен вернуть false для занятого email", async () => {
      // Создание пользователя
      const userData = {
        email: "taken@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "Тест",
        lastName: "Пользователь",
        terms: true,
      };

      await request(app).post("/api/auth/register").send(userData);

      const response = await request(app)
        .post("/api/auth/check-email")
        .send({ email: userData.email })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.available).toBe(false);
    });

    it("должен вернуть ошибку без email", async () => {
      const response = await request(app)
        .post("/api/auth/check-email")
        .send({})
        .expect(400);

      expect(response.body.status).toBe("error");
    });
  });
});

describe("Health Check", () => {
  it("должен вернуть статус здоровья сервера", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body.status).toBe("success");
    expect(response.body.message).toContain("работает");
    expect(response.body.uptime).toBeDefined();
  });
});
