# Развертывание на Render

## Требования
- Node.js >=18
- GitHub репозиторий (https://github.com/wocner-bot/green-a)

## Шаги для развертывания

### 1. Подключение GitHub репозитория
1. Перейди на https://dashboard.render.com
2. Нажми "New +" → "Web Service"
3. Выбери "Connect a repository"
4. Авторизуйся на GitHub и разреши доступ
5. Выбери репозиторий `green-a`

### 2. Конфигурация сервиса
- **Name:** green-a
- **Branch:** main
- **Runtime:** Node
- **Build Command:** npm install
- **Start Command:** npm start
- **Plan:** Free (для начала)

### 3. Переменные окружения
Добавь в "Environment" на Render:

```
NODE_ENV=production
HOST=0.0.0.0
YOUTUBE_API_KEY=your_key_here
VIDEO_ANALYSIS_PROVIDER=local
```

Опционально для Azure OCR:

```
VIDEO_ANALYSIS_PROVIDER=azure
AZURE_VIDEO_INDEXER_ACCOUNT_ID=...
AZURE_VIDEO_INDEXER_LOCATION=...
AZURE_VIDEO_INDEXER_ACCESS_TOKEN=...
# или вместо токена:
AZURE_VIDEO_INDEXER_SUBSCRIPTION_KEY=...
AZURE_VIDEO_INDEXER_LANGUAGE=AutoDetect
AZURE_VIDEO_INDEXER_POLL_MS=7000
AZURE_VIDEO_INDEXER_MAX_POLLS=22
AZURE_VIDEO_INDEXER_TIMEOUT_MS=30000
```

### 4. Deploy
Нажми "Deploy Service" - Render автоматически запустит процесс сборки и развертывания.

## Мониторинг

После развертывания:
- Проверь логи в "Logs" разделе Render
- Тестируй здоровье сервиса на `/healthz`
- Изучи производительность в "Metrics"

## Обновления

Любые push в главную ветку (main) автоматически запустят новое развертывание.

## Файлы конфигурации

- `render.yaml` - основная конфигурация Render
- `.env.example` - пример переменных окружения
- `package.json` - зависимости и версия Node

## Помощь

- Документация Render: https://render.com/docs
- Проверь логи сервиса для диагностики
