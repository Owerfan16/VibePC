"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth, useRole } from "@/contexts/AuthContext";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, logout, isLoading } = useAuth();
  const { role, isAdmin, isManager } = useRole();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "manager":
        return "Менеджер";
      case "user":
        return "Пользователь";
      default:
        return "Пользователь";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-400/10";
      case "manager":
        return "text-yellow-400 bg-yellow-400/10";
      case "user":
        return "text-green-400 bg-green-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-[#1a1a1a] border border-gray-600 rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      {/* Заголовок профиля */}
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center space-x-4">
          {/* Аватар */}
          <div className="w-12 h-12 bg-gradient-to-r from-[#7951F4] to-[#5A3FBF] rounded-full flex items-center justify-center">
            {user.profile?.avatar ? (
              <img
                src={user.profile.avatar}
                alt={user.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-lg">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            )}
          </div>

          {/* Информация о пользователе */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{user.fullName}</h3>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}
            >
              {getRoleName(user.role)}
            </div>
          </div>
        </div>

        {/* Статус верификации */}
        <div className="mt-3 flex items-center space-x-2">
          {user.isEmailVerified ? (
            <div className="flex items-center text-green-400 text-xs">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Email подтвержден
            </div>
          ) : (
            <div className="flex items-center text-yellow-400 text-xs">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Email не подтвержден
            </div>
          )}
        </div>
      </div>

      {/* Меню */}
      <div className="py-2">
        {/* Профиль */}
        <button className="w-full px-6 py-3 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center">
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Мой профиль
        </button>

        {/* Заказы */}
        <button className="w-full px-6 py-3 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center">
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Мои заказы
        </button>

        {/* Настройки */}
        <button className="w-full px-6 py-3 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center">
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Настройки
        </button>

        {/* Административные функции */}
        {(isAdmin() || isManager()) && (
          <>
            <div className="border-t border-gray-600 my-2"></div>

            {isAdmin() && (
              <button className="w-full px-6 py-3 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center">
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                Управление пользователями
              </button>
            )}

            <button className="w-full px-6 py-3 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center">
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Статистика и аналитика
            </button>
          </>
        )}

        {/* Разделитель */}
        <div className="border-t border-gray-600 my-2"></div>

        {/* Помощь */}
        <button className="w-full px-6 py-3 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors flex items-center">
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Помощь и поддержка
        </button>

        {/* Выход */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full px-6 py-3 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <svg
                className="animate-spin w-5 h-5 mr-3"
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
              Выход...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Выйти из аккаунта
            </>
          )}
        </button>
      </div>

      {/* Информация об аккаунте */}
      <div className="border-t border-gray-600 p-4 bg-[#0f0f0f]">
        <div className="text-xs text-gray-500">
          <div>
            Последний вход:{" "}
            {user.lastLogin
              ? new Date(user.lastLogin).toLocaleDateString("ru-RU")
              : "Не зафиксирован"}
          </div>
          <div className="mt-1">
            Аккаунт создан:{" "}
            {new Date(user.createdAt).toLocaleDateString("ru-RU")}
          </div>
        </div>
      </div>
    </div>
  );
}
