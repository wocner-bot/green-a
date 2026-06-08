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

Опционально для Qwen-VL visual analysis:

```
VISION_ANALYSIS_PROVIDER=hybrid
QWEN_VL_API_KEY=...
QWEN_VL_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_VL_MODEL=qwen3-vl-plus
QWEN_VL_MAX_FRAMES=8
QWEN_VL_TIMEOUT_MS=30000
QWEN_VL_MAX_IMAGE_WIDTH=1280
QWEN_VL_MIN_SCENE_GAP_SECONDS=20
```

Опционально для OpenAI AI-анализа образовательного формата:

```
AI_ANALYSIS_PROVIDER=hybrid
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.2
OPENAI_TIMEOUT_MS=30000
AI_ANALYSIS_MAX_TRANSCRIPT_WORDS=5000
```

Явные поля для Render Environment:

| Key | Value | Что делать |
|---|---|---|
| `AI_ANALYSIS_PROVIDER` | `hybrid` | Добавить/оставить так. Включает OpenAI как дополнительный AI-анализ с fallback. |
| `OPENAI_API_KEY` | `sk-...` | Вставить свой OpenAI API key. Это секрет, не коммитить в GitHub. |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Добавить/оставить так. |
| `OPENAI_MODEL` | `gpt-5.2` | Добавить/оставить так, если нужен текущий основной AI-анализ. |
| `OPENAI_TIMEOUT_MS` | `30000` | Добавить/оставить так. |
| `AI_ANALYSIS_MAX_TRANSCRIPT_WORDS` | `5000` | Добавить/оставить так, чтобы ограничить стоимость анализа. |

После изменения переменных нажми `Save Changes`, затем `Manual Deploy` -> `Deploy latest commit`, если Render сам не перезапустит сервис.

### 4. Deploy
Нажми "Deploy Service" - Render автоматически запустит процесс сборки и развертывания.

## Мониторинг

После развертывания:
- Проверь логи в "Logs" разделе Render
- Тестируй здоровье сервиса на `/healthz`
- Изучи производительность в "Metrics"

## Обновления

Любые push в главную ветку (main) автоматически запустят новое развертывание.

## Автодеплой через GitHub Actions (резервный вариант)

В репозиторий добавлен workflow:

- `.github/workflows/render-deploy.yml`

Он запускается на каждый push в `main` и дергает Render Deploy Hook.

Что нужно сделать один раз в GitHub:

1. Открой `Settings` → `Secrets and variables` → `Actions`.
2. Создай секрет `RENDER_DEPLOY_HOOK`.
3. Вставь туда URL из Render: `Service` → `Settings` → `Deploy Hook`.

## Файлы конфигурации

- `render.yaml` - основная конфигурация Render
- `.env.example` - пример переменных окружения
- `package.json` - зависимости и версия Node

## Помощь

- Документация Render: https://render.com/docs
- Проверь логи сервиса для диагностики
