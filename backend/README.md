# VibePC Backend API

Бэкенд API для VibePC - платформы для сборки и продажи игровых компьютеров.

## 🚀 Технологии

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL база данных
- **Mongoose** - MongoDB ODM
- **JWT** - Аутентификация
- **bcryptjs** - Хеширование паролей
- **express-validator** - Валидация данных
- **helmet** - Безопасность HTTP заголовков
- **express-rate-limit** - Rate limiting
- **cors** - CORS поддержка

## 📋 Требования

- Node.js 18.0.0 или выше
- MongoDB 5.0 или выше
- npm или yarn

## 🛠 Установка

1. **Клонирование проекта:**

   ```bash
   git clone <repository-url>
   cd vibepc/backend
   ```

2. **Установка зависимостей:**

   ```bash
   npm install
   ```

3. **Настройка переменных окружения:**

   ```bash
   cp config.example.env .env
   ```

   Отредактируйте файл `.env` с вашими настройками:
   - `MONGODB_URI` - строка подключения к MongoDB
   - `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)
   - `JWT_REFRESH_SECRET` - секретный ключ для refresh токенов
   - `FRONTEND_URL` - URL фронтенда для CORS

4. **Запуск MongoDB:**

   ```bash
   # Локально
   mongod

   # Или через Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Запуск сервера:**

   ```bash
   # Разработка
   npm run dev

   # Продакшн
   npm start
   ```

## 📚 API Документация

### Аутентификация

#### Регистрация

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79001234567",
  "terms": true
}
```

#### Вход

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "rememberMe": true
}
```

#### Выход

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### Обновление токена

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### Получение текущего пользователя

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Сброс пароля

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "<reset_token>",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### Верификация email

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "<verification_token>"
}
```

#### Проверка доступности email

```http
POST /api/auth/check-email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Пользователи

#### Получение профиля

```http
GET /api/user/profile
Authorization: Bearer <access_token>
```

#### Обновление профиля

```http
PUT /api/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Петр",
  "lastName": "Петров",
  "phone": "+79009876543",
  "profile": {
    "birthDate": "1990-01-01T00:00:00.000Z",
    "address": {
      "city": "Москва",
      "street": "ул. Примерная, д. 1",
      "zipCode": "123456"
    },
    "preferences": {
      "newsletter": true,
      "notifications": false
    }
  }
}
```

#### Смена пароля

```http
PUT /api/user/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmNewPassword": "NewPassword123"
}
```

#### Удаление аккаунта

```http
DELETE /api/user/account
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "Password123"
}
```

### Администрирование (только для admin/manager)

#### Статистика пользователей

```http
GET /api/user/stats
Authorization: Bearer <access_token>
```

#### Список пользователей

```http
GET /api/user/list?page=1&limit=20&search=иван&role=user&isActive=true
Authorization: Bearer <access_token>
```

#### Изменение роли пользователя

```http
PUT /api/user/:userId/role
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "manager"
}
```

#### Блокировка/разблокировка пользователя

```http
PUT /api/user/:userId/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isActive": false
}
```

## 🔒 Безопасность

### Реализованные меры безопасности:

1. **Хеширование паролей** - bcrypt с salt rounds = 12
2. **JWT токены** - Access (15 мин) + Refresh (30 дней)
3. **Rate limiting** - 100 запросов/15 мин, 5 попыток входа/15 мин
4. **Блокировка аккаунта** - после 5 неудачных попыток входа на 2 часа
5. **CORS настройки** - только разрешенные домены
6. **Helmet** - защита HTTP заголовков
7. **Валидация данных** - строгая валидация всех входящих данных
8. **Санитизация** - очистка от XSS атак
9. **HTTPS only cookies** - в продакшене
10. **Деактивация вместо удаления** - soft delete аккаунтов

### Пароли:

- Минимум 6 символов
- Должны содержать строчные и заглавные буквы
- Должны содержать цифры
- Не могут совпадать с текущим при смене

### Роли пользователей:

- `user` - обычный пользователь
- `manager` - менеджер (доступ к списку пользователей)
- `admin` - администратор (полный доступ)

## 📊 Мониторинг

### Health Check

```http
GET /api/health
```

Возвращает статус сервера, время работы и время ответа.

### Логирование

- Все ошибки логируются в консоль
- В продакшене рекомендуется использовать Sentry или аналог

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage
```

## 🚀 Деплой

### Переменные окружения для продакшена:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vibepc
JWT_SECRET=very-long-random-string-for-production
JWT_REFRESH_SECRET=another-very-long-random-string
FRONTEND_URL=https://yourdomain.com
COOKIE_DOMAIN=yourdomain.com
```

### Рекомендации:

1. Используйте MongoDB Atlas или аналогичный облачный сервис
2. Настройте SSL/TLS сертификаты
3. Используйте reverse proxy (nginx)
4. Настройте мониторинг (PM2, Docker)
5. Регулярные бэкапы базы данных

## 📝 TODO

- [ ] Email отправка (регистрация, сброс пароля)
- [ ] Загрузка аватаров (Cloudinary)
- [ ] Redis для сессий и кеширования
- [ ] Elasticsearch для поиска
- [ ] WebSocket для real-time уведомлений
- [ ] API для продуктов и заказов
- [ ] Интеграция с платежными системами
- [ ] Логирование в файлы
- [ ] Метрики и аналитика

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
