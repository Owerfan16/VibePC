# VibePC - Конфигуратор и готовые сборки игровых ПК

Полнофункциональная платформа для сборки, конфигурации и покупки игровых компьютеров с современной системой аутентификации.

## 🚀 Особенности проекта

### Frontend (Next.js 14)

- ✅ **Современный дизайн** - адаптивный интерфейс с темной темой
- ✅ **Система аутентификации** - регистрация, вход, профиль пользователя
- ✅ **Модальные окна** - удобные формы авторизации
- ✅ **TypeScript** - типизированный код для надежности
- ✅ **Tailwind CSS** - современная стилизация
- ✅ **React Context** - управление состоянием аутентификации

### Backend (Node.js + Express)

- ✅ **RESTful API** - полноценный API для всех операций
- ✅ **JWT аутентификация** - безопасная система токенов
- ✅ **MongoDB + Mongoose** - надежная база данных
- ✅ **Валидация данных** - строгая проверка всех входящих данных
- ✅ **Безопасность** - bcrypt, rate limiting, CORS, helmet
- ✅ **Система ролей** - user, manager, admin
- ✅ **Защита от брутфорса** - блокировка аккаунтов
- ✅ **Тестирование** - Jest + Supertest

## 📋 Требования

- Node.js 18.0.0 или выше
- MongoDB 5.0 или выше
- npm или yarn

## 🛠 Быстрый старт

### 1. Клонирование проекта

```bash
git clone <repository-url>
cd vibepc
```

### 2. Установка зависимостей

**Бэкенд:**

```bash
cd backend
npm install
```

**Фронтенд:**

```bash
cd frontend
npm install
```

### 3. Настройка переменных окружения

**Бэкенд** (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vibepc
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

**Фронтенд** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Запуск MongoDB

**Локально:**

```bash
mongod
```

**Через Docker:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Запуск серверов

**Бэкенд** (в папке backend):

```bash
npm run dev
```

**Фронтенд** (в папке frontend):

```bash
npm run dev
```

## 🎯 Доступные функции

### 🔐 Аутентификация

- **Регистрация** - с валидацией данных и хешированием паролей
- **Вход в систему** - с поддержкой "Запомнить меня"
- **Профиль пользователя** - просмотр и управление аккаунтом
- **Выход** - безопасная очистка сессии
- **Защита роутов** - доступ только для авторизованных пользователей

### 👤 Управление пользователями

- **Роли** - user (пользователь), manager (менеджер), admin (администратор)
- **Профиль** - аватар, личная информация, настройки
- **Безопасность** - смена пароля, двухфакторная аутентификация
- **История** - отслеживание активности

### 🛡️ Безопасность

- **JWT токены** - Access (15 мин) + Refresh (30 дней)
- **Хеширование паролей** - bcrypt с salt rounds = 12
- **Rate limiting** - защита от спама и атак
- **Валидация** - строгая проверка всех данных
- **CORS** - настроенные правила безопасности

## 📱 Использование

### Кнопка "Профиль" в шапке

- **Не авторизован** → открывает модальное окно входа/регистрации
- **Авторизован** → показывает выпадающее меню профиля

### Модальное окно авторизации

- Переключение между входом и регистрацией
- Валидация в реальном времени
- Показ/скрытие пароля
- Обработка ошибок

### Профиль пользователя

- Информация об аккаунте
- Роль и статус
- Быстрые действия
- Административные функции (для admin/manager)

## 🧪 Тестирование

### Запуск тестов бэкенда:

```bash
cd backend
npm test
```

### Покрытие тестами:

- Регистрация пользователей
- Аутентификация
- Валидация данных
- API эндпоинты
- Безопасность

## 📊 API Документация

### Основные эндпоинты:

**Аутентификация:**

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/refresh-token` - Обновление токена

**Пользователи:**

- `GET /api/user/profile` - Профиль
- `PUT /api/user/profile` - Обновление профиля
- `PUT /api/user/change-password` - Смена пароля
- `GET /api/user/stats` - Статистика (admin)

**Служебные:**

- `GET /api/health` - Проверка здоровья API

Полная документация доступна в `backend/README.md`

## 🔄 Архитектура

```
vibepc/
├── frontend/              # Next.js приложение
│   ├── src/
│   │   ├── app/          # App Router (страницы)
│   │   ├── components/   # React компоненты
│   │   ├── contexts/     # React контексты
│   │   └── lib/          # Утилиты и API клиент
│   └── public/           # Статические файлы
│
├── backend/              # Express.js API
│   ├── models/          # Mongoose модели
│   ├── routes/          # API роуты
│   ├── middleware/      # Middleware функции
│   ├── tests/           # Тесты
│   └── server.js        # Главный файл сервера
│
└── README.md            # Документация проекта
```

## 🚀 Деплой

### Продакшн переменные:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vibepc
JWT_SECRET=very-long-random-production-secret
FRONTEND_URL=https://yourdomain.com
```

### Рекомендации:

1. Используйте MongoDB Atlas или аналогичный сервис
2. Настройте SSL/TLS сертификаты
3. Используйте reverse proxy (nginx)
4. Настройте мониторинг (PM2, Docker)
5. Регулярные бэкапы базы данных

## 📝 TODO (Будущие возможности)

- [ ] Email верификация и уведомления
- [ ] Загрузка аватаров пользователей
- [ ] Двухфакторная аутентификация (2FA)
- [ ] Социальные логины (Google, VK, Yandex)
- [ ] Продвинутые роли и права доступа
- [ ] API для продуктов и конфигураций
- [ ] Система заказов и платежей
- [ ] Административная панель
- [ ] Mobile приложение
- [ ] WebSocket уведомления

## 🤝 Участие в разработке

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License. Подробности в файле LICENSE.

## 📞 Поддержка

- Email: support@vibepc.ru
- Telegram: @vibepc_support
- Discord: discord.gg/vibepc

---

**VibePC** - создаем идеальные игровые компьютеры! 🎮
