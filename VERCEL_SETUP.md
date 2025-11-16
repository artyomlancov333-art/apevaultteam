# Настройка Vercel для деплоя ApeVault

## Проблема: "Social Account is not yet connected to any Vercel user"

Это означает, что ваш GitHub аккаунт не подключен к Vercel. Вот как это исправить:

## Способ 1: Подключение через веб-интерфейс Vercel

### Шаг 1: Войдите в Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **"Sign Up"** или **"Log In"**

### Шаг 2: Войдите через GitHub

1. На странице входа выберите **"Continue with GitHub"**
2. Авторизуйтесь через GitHub
3. Разрешите Vercel доступ к вашему GitHub аккаунту

### Шаг 3: Создайте новый проект

1. После входа нажмите **"Add New..."** → **"Project"**
2. Выберите **"Import Git Repository"**
3. Выберите ваш репозиторий `apevault` (или как вы его назвали)
4. Нажмите **"Import"**

### Шаг 4: Настройте проект

1. **Framework Preset:** выберите **"Vite"** (или оставьте "Other")
2. **Root Directory:** оставьте `./` (точка)
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Шаг 5: Добавьте переменные окружения

Перед деплоем добавьте переменные окружения:

1. В разделе **"Environment Variables"** добавьте:
   - `VITE_FIREBASE_API_KEY` = ваш Firebase API Key
   - `VITE_FIREBASE_AUTH_DOMAIN` = ваш Firebase Auth Domain
   - `VITE_FIREBASE_PROJECT_ID` = ваш Firebase Project ID
   - `VITE_FIREBASE_STORAGE_BUCKET` = ваш Firebase Storage Bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = ваш Firebase Messaging Sender ID
   - `VITE_FIREBASE_APP_ID` = ваш Firebase App ID

2. Нажмите **"Deploy"**

## Способ 2: Подключение через Vercel CLI

Если предпочитаете использовать командную строку:

### Шаг 1: Установите Vercel CLI

```bash
npm install -g vercel
```

### Шаг 2: Войдите в Vercel

```bash
vercel login
```

Выберите **"GitHub"** для входа через GitHub.

### Шаг 3: Деплой проекта

```bash
# В папке проекта
vercel
```

Следуйте инструкциям:
- Set up and deploy? **Y**
- Which scope? выберите ваш аккаунт
- Link to existing project? **N**
- What's your project's name? `apevault` (или любое другое)
- In which directory is your code located? `./`

### Шаг 4: Добавьте переменные окружения

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

Для каждого введите значение из вашего `.env` файла.

### Шаг 5: Деплой в продакшн

```bash
vercel --prod
```

## Проверка подключения GitHub к Vercel

Если вы уже залогинены в Vercel, но GitHub не подключен:

1. Перейдите в [Vercel Settings](https://vercel.com/account)
2. Откройте раздел **"Connected Accounts"** или **"Git"**
3. Нажмите **"Connect"** рядом с GitHub
4. Авторизуйтесь и разрешите доступ

## Решение проблем

### Проблема: "No Git repository found"

**Решение:** Убедитесь, что:
- Проект загружен на GitHub
- Вы авторизованы в Vercel через GitHub
- Репозиторий виден в списке при создании проекта

### Проблема: Переменные окружения не работают

**Решение:**
- Убедитесь, что переменные добавлены для всех окружений (Production, Preview, Development)
- После добавления переменных передеплойте проект

### Проблема: Сборка падает с ошибками

**Решение:**
- Проверьте логи сборки в Vercel Dashboard
- Убедитесь, что все зависимости указаны в `package.json`
- Проверьте, что переменные окружения добавлены правильно

## После успешного деплоя

1. Vercel предоставит вам URL вида: `https://apevault-xxx.vercel.app`
2. Вы можете настроить кастомный домен в настройках проекта
3. Каждый push в GitHub будет автоматически деплоить новую версию (если включен Auto Deploy)

## Полезные команды Vercel CLI

```bash
# Просмотр информации о проекте
vercel ls

# Просмотр логов
vercel logs

# Удаление проекта
vercel remove

# Просмотр переменных окружения
vercel env ls
```

## Готово!

После выполнения этих шагов ваш проект будет задеплоен на Vercel и доступен по URL, который предоставит Vercel.

