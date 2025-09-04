"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, User, AuthResponse, LoginData, RegisterData } from "@/lib/api";

// Типы для состояния аутентификации
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Типы для действий
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Начальное состояние
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer для управления состоянием
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Контекст
interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Функция для проверки аутентификации
  const checkAuth = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const token = api.getToken();
      if (!token) {
        throw new Error("Токен не найден");
      }

      const response = await api.getCurrentUser();
      if (response.status === "success") {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.user });
      } else {
        throw new Error("Не удалось получить данные пользователя");
      }
    } catch (error) {
      // Очищаем токен если он недействителен
      api.setToken(null);
      dispatch({ type: "AUTH_ERROR", payload: "Сессия истекла" });
    }
  }, []);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Функция входа
  const login = useCallback(async (data: LoginData) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await api.login(data);

      if (response.status === "success" && response.data) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.user });
      } else {
        throw new Error(response.message || "Ошибка входа");
      }
    } catch (error: any) {
      let errorMessage = "Ошибка входа в систему";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors?.length > 0) {
        errorMessage = error.errors.map((err: any) => err.message).join(", ");
      }

      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  // Функция регистрации
  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await api.register(data);

      if (response.status === "success" && response.data) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.user });
      } else {
        throw new Error(response.message || "Ошибка регистрации");
      }
    } catch (error: any) {
      let errorMessage = "Ошибка регистрации";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors?.length > 0) {
        errorMessage = error.errors.map((err: any) => err.message).join(", ");
      }

      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  // Функция выхода
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      // Игнорируем ошибки при выходе
    } finally {
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  // Функция очистки ошибки
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Хук для проверки ролей
export const useRole = () => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: string | string[]) => {
    if (!isAuthenticated || !user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  const isAdmin = () => hasRole("admin");
  const isManager = () => hasRole(["admin", "manager"]);
  const isUser = () => hasRole("user");

  return {
    hasRole,
    isAdmin,
    isManager,
    isUser,
    role: user?.role,
  };
};

export default AuthContext;
