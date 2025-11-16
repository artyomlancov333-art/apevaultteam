# Инструкция по деплою ApeVault

## Подготовка к деплою

### 1. Настройка Firebase

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект или используйте существующий
3. Включите Firestore Database:
   - Перейдите в раздел "Firestore Database"
   - Нажмите "Create database"
   - Выберите режим "Start in production mode" (позже настроим правила)
   - Выберите регион

4. Настройте правила безопасности Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Получите конфигурацию Firebase:
   - Перейдите в "Project Settings" → "General"
   - Найдите секцию "Your apps"
   - Нажмите на иконку веб-приложения (</>)
   - Скопируйте значения конфигурации

### 2. Создание переменных окружения

Создайте файл `.env` в корне проекта:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Важно:** Не коммитьте файл `.env` в Git! Он уже добавлен в `.gitignore`.

### 3. Локальная проверка

Перед деплоем убедитесь, что приложение работает локально:

```bash
npm install
npm run dev
```

Откройте http://localhost:5173 и проверьте:
- Авторизацию
- Создание слотов
- Добавление заработка
- Просмотр рейтинга

## Деплой на Vercel

### Важно: Подключение GitHub к Vercel

Если вы видите ошибку **"Social Account is not yet connected to any Vercel user"**:

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **"Sign Up"** или **"Log In"**
3. Выберите **"Continue with GitHub"**
4. Авторизуйтесь и разрешите доступ Vercel к вашему GitHub аккаунту

Подробная инструкция: см. файл `VERCEL_SETUP.md`

### Способ 1: Через Vercel CLI

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в Vercel:
```bash
vercel login
```

3. Деплой:
```bash
vercel
```

4. Следуйте инструкциям:
   - Выберите проект (или создайте новый)
   - Подтвердите настройки
   - Дождитесь завершения деплоя

5. Добавьте переменные окружения:
   - Перейдите на [vercel.com](https://vercel.com)
   - Откройте ваш проект
   - Перейдите в "Settings" → "Environment Variables"
   - Добавьте все переменные из `.env` файла:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

6. Передеплойте проект:
```bash
vercel --prod
```

### Способ 2: Через GitHub

1. Создайте репозиторий на GitHub

2. Загрузите код:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/apevault.git
git push -u origin main
```

3. Подключите к Vercel:
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Импортируйте репозиторий GitHub
   - Настройте проект:
     - Framework Preset: Vite
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `dist`

4. Добавьте переменные окружения (см. Способ 1, шаг 5)

5. Деплой произойдет автоматически

## Деплой Telegram бота

### Вариант 1: Локальный сервер

1. Установите зависимости:
```bash
cd telegram-bot
npm install
```

2. Создайте файл `.env`:
```env
BOT_TOKEN=your-telegram-bot-token
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id
```

3. Получите serviceAccountKey.json:
   - В Firebase Console перейдите в "Project Settings" → "Service accounts"
   - Нажмите "Generate new private key"
   - Сохраните файл как `telegram-bot/serviceAccountKey.json`

4. Создайте бота в Telegram:
   - Напишите [@BotFather](https://t.me/botfather)
   - Используйте команду `/newbot`
   - Следуйте инструкциям
   - Скопируйте токен бота в `.env`

5. Запустите бота:
```bash
npm start
```

### Вариант 2: VPS/Cloud сервер

1. Подключитесь к серверу по SSH

2. Установите Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/apevault.git
cd apevault/telegram-bot
```

4. Установите зависимости:
```bash
npm install
```

5. Настройте `.env` и `serviceAccountKey.json` (см. Вариант 1)

6. Используйте PM2 для постоянной работы:
```bash
npm install -g pm2
pm2 start index.js --name apevault-bot
pm2 save
pm2 startup
```

## Проверка после деплоя

1. Откройте веб-приложение
2. Проверьте авторизацию
3. Создайте тестовый слот
4. Добавьте тестовый заработок
5. Проверьте рейтинг

## Обновление приложения

### Веб-приложение

После изменений в коде:

```bash
git add .
git commit -m "Update"
git push
```

Vercel автоматически задеплоит изменения.

### Telegram бот

На сервере:

```bash
cd telegram-bot
git pull
pm2 restart apevault-bot
```

## Решение проблем

### Ошибка подключения к Firebase

- Проверьте правильность переменных окружения
- Убедитесь, что Firestore включен
- Проверьте правила безопасности Firestore

### Ошибка авторизации

- Проверьте, что учетные данные соответствуют `TEAM_MEMBERS` в коде
- Убедитесь, что данные сохраняются в localStorage

### Бот не отвечает

- Проверьте токен бота
- Убедитесь, что бот запущен (`pm2 status`)
- Проверьте логи: `pm2 logs apevault-bot`

## Поддержка

При возникновении проблем проверьте:
1. Логи в Vercel Dashboard
2. Логи Firebase Console
3. Консоль браузера (F12)

