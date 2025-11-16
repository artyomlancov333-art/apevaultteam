# Инструкция по загрузке проекта на GitHub

## Шаг 1: Создание репозитория на GitHub

1. Перейдите на [GitHub](https://github.com)
2. Нажмите кнопку **"New"** или **"+"** → **"New repository"**
3. Заполните данные:
   - **Repository name:** `apevault` (или любое другое имя)
   - **Description:** "ApeVault - Командная панель управления"
   - Выберите **Public** или **Private** (рекомендуется Private)
   - **НЕ** отмечайте "Initialize this repository with a README"
4. Нажмите **"Create repository"**

## Шаг 2: Инициализация Git в проекте

Откройте терминал в папке проекта и выполните:

```bash
# Инициализация Git репозитория
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: ApeVault project"
```

## Шаг 3: Подключение к GitHub

```bash
# Добавление удаленного репозитория
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/apevault.git

# Или если используете SSH:
# git remote add origin git@github.com:YOUR_USERNAME/apevault.git
```

## Шаг 4: Загрузка на GitHub

```bash
# Переименование ветки в main (если нужно)
git branch -M main

# Загрузка на GitHub
git push -u origin main
```

## Важно: Файлы, которые НЕ будут загружены

Благодаря `.gitignore`, следующие файлы **НЕ** будут загружены на GitHub:

- `.env` - файл с секретными ключами Firebase
- `node_modules/` - зависимости проекта
- `dist/` - собранные файлы
- `.env.local`, `.env.production.local` - локальные переменные окружения

## Что нужно сделать после загрузки

### 1. Добавить описание репозитория

На странице репозитория GitHub:
- Добавьте описание проекта
- Добавьте теги (tags): `react`, `typescript`, `firebase`, `vercel`

### 2. Создать файл с инструкциями по настройке

GitHub автоматически покажет `README.md`, который уже создан.

### 3. Настроить Secrets для GitHub Actions (если нужно)

Если планируете использовать CI/CD:
1. Перейдите в **Settings** → **Secrets and variables** → **Actions**
2. Добавьте секреты для переменных окружения Firebase

### 4. Подключить к Vercel (опционально)

После загрузки на GitHub можно подключить автоматический деплой:

1. Перейдите на [Vercel](https://vercel.com)
2. Нажмите **"New Project"**
3. Импортируйте репозиторий с GitHub
4. Добавьте переменные окружения
5. Деплой произойдет автоматически

## Структура файлов на GitHub

После загрузки на GitHub будут видны:

```
apevault/
├── src/                    # Исходный код
├── telegram-bot/           # Telegram бот
├── public/                 # Публичные файлы (если есть)
├── .gitignore             # Игнорируемые файлы
├── package.json           # Зависимости
├── tsconfig.json          # TypeScript конфигурация
├── vite.config.ts         # Vite конфигурация
├── tailwind.config.js     # Tailwind конфигурация
├── README.md              # Описание проекта
├── DEPLOYMENT.md          # Инструкция по деплою
├── QUICKSTART.md          # Быстрый старт
├── PROJECT_STRUCTURE.md   # Структура проекта
└── GITHUB_SETUP.md        # Эта инструкция
```

## Проверка перед загрузкой

Убедитесь, что:

- ✅ Файл `.env` **НЕ** добавлен в Git (проверьте `.gitignore`)
- ✅ Все зависимости указаны в `package.json`
- ✅ README.md содержит актуальную информацию
- ✅ Нет секретных ключей в коде

## Команды для проверки

```bash
# Проверить, какие файлы будут загружены
git status

# Проверить содержимое .gitignore
cat .gitignore

# Убедиться, что .env не отслеживается
git check-ignore .env
# Должно вывести: .env
```

## Если нужно обновить проект на GitHub

После внесения изменений:

```bash
# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Загрузить на GitHub
git push
```

## Решение проблем

### Ошибка: "remote origin already exists"

```bash
# Удалить существующий remote
git remote remove origin

# Добавить заново
git remote add origin https://github.com/YOUR_USERNAME/apevault.git
```

### Ошибка: "failed to push some refs"

```bash
# Получить изменения с GitHub
git pull origin main --allow-unrelated-histories

# Разрешить конфликты (если есть)
# Затем снова загрузить
git push -u origin main
```

### Забыли добавить .env в .gitignore

Если случайно загрузили `.env`:

```bash
# Удалить из Git (но оставить локально)
git rm --cached .env

# Добавить в .gitignore (если еще не добавлен)
echo ".env" >> .gitignore

# Закоммитить изменения
git add .gitignore
git commit -m "Remove .env from repository"

# Загрузить на GitHub
git push
```

## Готово!

После выполнения всех шагов ваш проект будет доступен на GitHub и готов к деплою на Vercel.

