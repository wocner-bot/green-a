# Спецификация: интеграция Qwen-VL для анализа изображения на видео

Дата: 2026-06-02  
Проект: Green A

## 1. Цель

Добавить Qwen-VL как опциональный vision-provider для анализа кадров YouTube-ролика, чтобы точнее определять признаки визуального обучения:
- слайды;
- схемы;
- графики;
- формулы;
- код;
- доска/whiteboard;
- демонстрация интерфейса;
- пошаговые визуальные инструкции.

Qwen-VL не должен заменять текущий анализ субтитров, описания и локальный OCR. Он должен добавлять дополнительный слой понимания картинки, который затем используется в `Education Score`.

## 2. Что именно должен делать Qwen-VL

Qwen-VL должен анализировать не весь ролик целиком, а набор ключевых кадров.

Для каждого ролика сервис должен:
1. Получить YouTube metadata, description, chapters и subtitles как сейчас.
2. Получить stream URL через существующий resolver.
3. Извлечь ограниченное количество ключевых кадров через `ffmpeg`.
4. Отправить кадры в Qwen-VL.
5. Получить структурированный JSON с визуальными признаками.
6. Добавить результат в `mediaAnalysis.visual`, `mediaAnalysis.ocr` или `visualObservations`.
7. Использовать эти признаки в расчете `Education Score`, особенно в критерии "Наличие визуального обучения" 0-10.

## 3. Почему анализировать кадры, а не видеофайл целиком

Анализ кадров предпочтительнее прямой отправки видео, потому что:
- дешевле;
- быстрее;
- меньше риск таймаута на Render;
- проще контролировать количество данных;
- проще сохранять fallback на локальный `tesseract`;
- не нужно хранить или публично публиковать видеофайл.

Если позже понадобится полноценное video understanding, его можно добавить как отдельный режим, но базовая интеграция должна работать через кадры.

## 4. Источники и API

Официальный провайдер: Alibaba Cloud Model Studio / DashScope.

Qwen-VL можно вызывать через OpenAI-compatible API:
- `POST /chat/completions`;
- изображения передаются через `image_url`;
- base URL зависит от региона.

Официальные ссылки:
- `https://www.alibabacloud.com/help/en/model-studio/qwen-vl-compatible-with-openai`
- `https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api`
- `https://www.alibabacloud.com/help/en/model-studio/vision/`

## 5. Переменные окружения

Добавить новые переменные:

```text
VISION_ANALYSIS_PROVIDER=local|qwen|hybrid
QWEN_VL_API_KEY=
QWEN_VL_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_VL_MODEL=qwen3-vl-plus
QWEN_VL_MAX_FRAMES=8
QWEN_VL_TIMEOUT_MS=30000
QWEN_VL_MAX_IMAGE_WIDTH=1280
QWEN_VL_MIN_SCENE_GAP_SECONDS=20
```

Режимы:
- `local`: только текущий локальный анализ через `ffmpeg` и `tesseract`;
- `qwen`: Qwen-VL как основной vision/OCR-provider, локальный OCR используется как fallback при ошибке;
- `hybrid`: локальный OCR + Qwen-VL, результаты объединяются.

Для Render рекомендуется:

```text
VIDEO_ANALYSIS_PROVIDER=hybrid
VISION_ANALYSIS_PROVIDER=hybrid
QWEN_VL_API_KEY=...
QWEN_VL_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_VL_MODEL=qwen3-vl-plus
QWEN_VL_MAX_FRAMES=8
QWEN_VL_TIMEOUT_MS=30000
```

## 6. Data flow

```text
YouTube URL
-> metadata + description + chapters + subtitles
-> stream resolver
-> ffmpeg extracts key frames
-> local OCR with tesseract
-> Qwen-VL frame analysis
-> merge visual/OCR signals
-> Education Score
-> UI explanation
```

## 7. Извлечение кадров

Кадры должны выбираться экономно:
- максимум `QWEN_VL_MAX_FRAMES`;
- приоритет кадров из chapter/segment boundaries;
- если chapters нет, брать кадры с равным шагом;
- избегать кадров ближе чем `QWEN_VL_MIN_SCENE_GAP_SECONDS`;
- уменьшать ширину до `QWEN_VL_MAX_IMAGE_WIDTH`;
- использовать JPEG с умеренным качеством.

Цель: получить представление о визуальном формате ролика, а не анализировать каждую секунду.

## 8. Формат запроса к Qwen-VL

Запрос должен содержать:
- краткий системный контекст Green A;
- список кадров как `data:image/jpeg;base64,...`;
- инструкцию вернуть только JSON;
- просьбу отделять визуальное обучение от развлечения.

Пример prompt:

```text
Analyze these sampled frames from a YouTube video for educational visual content.

Return strict JSON only:
{
  "has_visual_teaching": boolean,
  "screen_type": "slides|code|whiteboard|demo|talking_head|game|movie|music_video|vlog|unknown",
  "visible_text": ["..."],
  "educational_visual_signals": ["diagrams", "formulas", "step_by_step", "examples", "code", "charts"],
  "entertainment_visual_signals": ["vlog", "prank", "gameplay", "reaction", "music_video", "movie"],
  "visual_learning_score": 0,
  "confidence": 0,
  "summary": "short explanation"
}
```

## 9. Формат результата в Green A

Нормализованный результат должен выглядеть так:

```json
{
  "available": true,
  "provider": "qwen-vl",
  "model": "qwen3-vl-plus",
  "framesAnalyzed": 8,
  "screenType": "slides",
  "visualLearningScore": 8,
  "confidence": 0.82,
  "visibleText": ["Step 1", "Revenue formula", "Example"],
  "educationalSignals": ["slides", "charts", "step_by_step"],
  "negativeSignals": [],
  "summary": "Frames show slides with structured explanations and examples.",
  "warnings": []
}
```

Этот результат должен попадать в:
- `mediaAnalysis.visualUnderstanding`;
- `visualObservations`;
- текстовый блок `ocr`, чтобы текущая логика UI и экспорта могла показать найденные признаки.

## 10. Влияние на Education Score

Qwen-VL должен влиять на критерий "Наличие визуального обучения" до 10 баллов.

Пример маппинга:
- `visualLearningScore` 0-2: нет визуального обучения;
- `visualLearningScore` 3-5: слабые визуальные признаки;
- `visualLearningScore` 6-8: сильные признаки слайдов/кода/демонстрации;
- `visualLearningScore` 9-10: полноценное визуальное обучение с формулами, схемами, шагами или примерами.

Qwen-VL не должен автоматически делать ролик обучающим без поддержки от title/description/transcript. Но если транскрипта мало, сильные визуальные признаки должны поднимать ролик из `non-educational` в `uncertain` или `partially educational`.

## 11. Fallback и ошибки

Если Qwen-VL недоступен:
- не падать с ошибкой анализа всего ролика;
- сохранить локальный OCR;
- добавить warning в `mediaAnalysis.visualUnderstanding.warnings`;
- показать в UI, что Qwen-VL не сработал;
- продолжить расчет по metadata, subtitles, description и локальному OCR.

Типичные ошибки:
- нет `QWEN_VL_API_KEY`;
- неверный `QWEN_VL_BASE_URL`;
- timeout;
- rate limit;
- модель вернула невалидный JSON;
- кадры не удалось извлечь.

Для невалидного JSON нужно попытаться извлечь JSON-блок из текста ответа. Если не получилось, считать Qwen-VL недоступным для текущего ролика.

## 12. Ограничения безопасности и приватности

Не сохранять кадры дольше времени обработки.

Не логировать:
- API key;
- base64 кадров;
- полный сырой ответ модели, если он может содержать пользовательские данные.

Можно логировать:
- provider;
- model;
- количество кадров;
- длительность запроса;
- наличие ошибки;
- warning без секретов.

## 13. UI

В UI нужно показывать:
- какой vision-provider использован: `local`, `qwen-vl`, `hybrid`;
- сколько кадров проанализировано;
- тип экрана: slides/code/whiteboard/demo/etc.;
- `visualLearningScore`;
- краткое объяснение;
- предупреждение, если Qwen-VL не был доступен.

Это должно появляться в диагностике анализа, а не перегружать основную карточку рейтинга.

## 14. Тестирование

Нужны тесты на:
1. Нормализацию успешного Qwen-VL JSON.
2. Невалидный JSON от модели.
3. Ошибку API и fallback на локальный OCR.
4. `VISION_ANALYSIS_PROVIDER=local` не вызывает Qwen-VL.
5. `VISION_ANALYSIS_PROVIDER=qwen` вызывает Qwen-VL и сохраняет fallback warning при ошибке.
6. `VISION_ANALYSIS_PROVIDER=hybrid` объединяет локальный OCR и Qwen-VL.
7. Сильные visual teaching signals повышают визуальную часть `Education Score`.
8. Entertainment visual signals не повышают ролик до обучающего без текстовых учебных признаков.

## 15. Критерии приемки

1. При отсутствии Qwen env-переменных сервис работает как сейчас.
2. При включенном `VISION_ANALYSIS_PROVIDER=qwen|hybrid` и корректном API key сервис анализирует ключевые кадры через Qwen-VL.
3. Результат Qwen-VL виден в `mediaAnalysis.visualUnderstanding`.
4. UI показывает provider, score и summary.
5. Ошибка Qwen-VL не ломает анализ ролика.
6. В `Education Score` появляется вклад визуального обучения.
7. Локальный OCR остается fallback.
8. На Render можно включить Qwen-VL только через env-переменные, без изменения кода.

## 16. Не входит в первую версию

В первую версию не входит:
- отправка полного видеофайла в Qwen-VL;
- хранение кадров;
- анализ всех кадров ролика;
- замена Whisper/субтитров;
- полноценная объектная детекция;
- отдельная биллинговая панель для Qwen.

Первая версия должна быть маленькой и надежной: ключевые кадры, JSON, fallback, Education Score.
