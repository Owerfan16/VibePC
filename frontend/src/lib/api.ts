const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Типы для API
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "user" | "admin" | "manager";
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  profile?: {
    avatar?: string;
    birthDate?: string;
    address?: {
      city?: string;
      street?: string;
      zipCode?: string;
    };
    preferences?: {
      newsletter: boolean;
      notifications: boolean;
    };
  };
}

export interface AuthResponse {
  status: "success" | "error";
  message: string;
  data?: {
    user: User;
    accessToken: string;
  };
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  terms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ApiError {
  status: "error";
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

// API клиент
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    // Инициализация токена из localStorage при создании клиента
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken");
    }
  }

  // Установка токена
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  }

  // Получение токена
  getToken(): string | null {
    return this.token;
  }

  // Базовый метод для HTTP запросов
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Для cookies
      ...options,
    };

    // Добавление Authorization заголовка если есть токен
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Если токен истек, пытаемся обновить его
      if (
        response.status === 401 &&
        this.token &&
        endpoint !== "/auth/refresh-token"
      ) {
        try {
          await this.refreshToken();
          // Повторяем запрос с новым токеном
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${this.token}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
          return await retryResponse.json();
        } catch (refreshError) {
          // Если обновление токена не удалось, очищаем токен
          this.setToken(null);
          throw data;
        }
      }

      if (!response.ok) {
        throw data;
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          status: "error",
          message: error.message,
        };
      }
      throw error;
    }
  }

  // Регистрация
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Сохраняем токен после успешной регистрации
    if (response.status === "success" && response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  // Вход
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Сохраняем токен после успешного входа
    if (response.status === "success" && response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  // Выход
  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      // Игнорируем ошибки при выходе
    } finally {
      // Всегда очищаем токен локально
      this.setToken(null);
    }
  }

  // Получение текущего пользователя
  async getCurrentUser(): Promise<{ status: string; data: { user: User } }> {
    return this.request("/auth/me");
  }

  // Обновление токена
  async refreshToken(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/refresh-token", {
      method: "POST",
    });

    if (response.status === "success" && response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  // Проверка доступности email
  async checkEmailAvailability(
    email: string
  ): Promise<{ status: string; data: { available: boolean } }> {
    return this.request("/auth/check-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Сброс пароля
  async forgotPassword(
    email: string
  ): Promise<{ status: string; message: string }> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Установка нового пароля
  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ status: string; message: string }> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  }

  // Проверка здоровья API
  async healthCheck(): Promise<{
    status: string;
    message: string;
    uptime: number;
  }> {
    return this.request("/health");
  }
}

// Экспорт экземпляра API клиента
export const api = new ApiClient(API_BASE_URL);

// Вспомогательные функции
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};

// Константы для валидации
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Введите корректный email адрес",
  },
  password: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message:
      "Пароль должен содержать минимум 6 символов, включая строчные и заглавные буквы, а также цифры",
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[а-яёА-ЯЁa-zA-Z\s-]+$/,
    message:
      "Имя может содержать только буквы, пробелы и дефисы (2-50 символов)",
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: "Введите корректный номер телефона",
  },
};

export default api;
