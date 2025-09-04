"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { VALIDATION_RULES } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

type FormErrors = {
  [key: string]: string;
};

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const { login, register, isLoading, error, clearError, isAuthenticated } =
    useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    terms: false,
    rememberMe: false,
  });

  // Сброс формы при смене режима
  useEffect(() => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      terms: false,
      rememberMe: false,
    });
    setFormErrors({});
    setIsSuccess(false);
    clearError();
  }, [mode]); // Убираем clearError из зависимостей

  // Закрытие модала при успешной аутентификации
  useEffect(() => {
    if (isOpen && isSuccess && !isLoading && !error) {
      // Небольшая задержка для плавности
      const timer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isLoading, error, isOpen, onClose]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Валидация email
    if (!formData.email) {
      errors.email = "Email обязателен";
    } else if (!VALIDATION_RULES.email.pattern.test(formData.email)) {
      errors.email = VALIDATION_RULES.email.message;
    }

    // Валидация пароля
    if (!formData.password) {
      errors.password = "Пароль обязателен";
    } else if (formData.password.length < VALIDATION_RULES.password.minLength) {
      errors.password = VALIDATION_RULES.password.message;
    } else if (!VALIDATION_RULES.password.pattern.test(formData.password)) {
      errors.password = VALIDATION_RULES.password.message;
    }

    if (mode === "register") {
      // Валидация подтверждения пароля
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Подтвердите пароль";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Пароли не совпадают";
      }

      // Валидация имени
      if (!formData.firstName) {
        errors.firstName = "Имя обязательно";
      } else if (!VALIDATION_RULES.name.pattern.test(formData.firstName)) {
        errors.firstName = VALIDATION_RULES.name.message;
      }

      // Валидация фамилии
      if (!formData.lastName) {
        errors.lastName = "Фамилия обязательна";
      } else if (!VALIDATION_RULES.name.pattern.test(formData.lastName)) {
        errors.lastName = VALIDATION_RULES.name.message;
      }

      // Валидация телефона (опционально)
      if (
        formData.phone &&
        !VALIDATION_RULES.phone.pattern.test(formData.phone)
      ) {
        errors.phone = VALIDATION_RULES.phone.message;
      }

      // Валидация согласия с условиями
      if (!formData.terms) {
        errors.terms = "Необходимо принять пользовательское соглашение";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === "login") {
        await login({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          terms: formData.terms,
        });
      }
      // Устанавливаем флаг успеха только после успешной аутентификации
      setIsSuccess(true);
    } catch (error) {
      // Ошибка обрабатывается в контексте
      setIsSuccess(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Очистка ошибки поля при изменении
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  // Сброс состояния при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      clearError();
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md mx-auto relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          {/* Заголовок */}
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
          </h2>

          {/* Отображение общей ошибки */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Имя *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7951F4] transition-colors"
                      placeholder="Иван"
                    />
                    {formErrors.firstName && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7951F4] transition-colors"
                      placeholder="Иванов"
                    />
                    {formErrors.lastName && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7951F4] transition-colors"
                placeholder="example@email.com"
              />
              {formErrors.email && (
                <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            {mode === "register" && (
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7951F4] transition-colors"
                  placeholder="+7 (900) 123-45-67"
                />
                {formErrors.phone && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Пароль *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7951F4] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {mode === "register" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Подтвердите пароль *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7951F4] transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Чекбоксы */}
            <div className="space-y-3">
              {mode === "login" && (
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-600 bg-[#2a2a2a] text-[#7951F4] focus:ring-[#7951F4] focus:ring-1"
                  />
                  <span className="ml-2">Запомнить меня</span>
                </label>
              )}

              {mode === "register" && (
                <label className="flex items-start text-sm text-gray-300">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-[#2a2a2a] text-[#7951F4] focus:ring-[#7951F4] focus:ring-1"
                  />
                  <span className="ml-2">
                    Я принимаю{" "}
                    <a href="/terms" className="text-[#7951F4] hover:underline">
                      пользовательское соглашение
                    </a>{" "}
                    и{" "}
                    <a
                      href="/privacy"
                      className="text-[#7951F4] hover:underline"
                    >
                      политику конфиденциальности
                    </a>
                  </span>
                </label>
              )}

              {formErrors.terms && (
                <p className="text-red-400 text-xs">{formErrors.terms}</p>
              )}
            </div>

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7951F4] to-[#5A3FBF] text-white font-medium rounded-xl hover:from-[#6A42D6] hover:to-[#4A31A5] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {mode === "login" ? "Вход..." : "Регистрация..."}
                </div>
              ) : mode === "login" ? (
                "Войти"
              ) : (
                "Зарегистрироваться"
              )}
            </button>
          </form>

          {/* Переключение режима */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-gray-400 hover:text-[#7951F4] transition-colors"
            >
              {mode === "login" ? (
                <>
                  Нет аккаунта?{" "}
                  <span className="text-[#7951F4] font-medium">
                    Зарегистрироваться
                  </span>
                </>
              ) : (
                <>
                  Уже есть аккаунт?{" "}
                  <span className="text-[#7951F4] font-medium">Войти</span>
                </>
              )}
            </button>
          </div>

          {mode === "login" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-[#7951F4] transition-colors"
              >
                Забыли пароль?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
