const scales = [
  { id: "depth", label: "Содержательная глубина", weight: 24 },
  { id: "pedagogy", label: "Педагогическое качество", weight: 22 },
  { id: "structure", label: "Структурированность", weight: 18 },
  { id: "reliability", label: "Достоверность", weight: 16 },
  { id: "practice", label: "Практическая применимость", weight: 11 },
  { id: "complexity", label: "Когнитивная сложность", weight: 5 },
  { id: "technical", label: "Техническое качество", weight: 3 },
  { id: "communication", label: "Коммуникация", weight: 1 }
];

const demo = {
  url: "https://www.youtube.com/watch?v=green-argus-demo",
  title: "Как оценивать образовательные видео: теория, практика и источники",
  topic: "Методология обучения",
  transcript: `Сегодня разберем критерии качества обучающего видео. Сначала определим термины: цель обучения, когнитивная нагрузка, пример, практика и проверка понимания. Затем покажу, как применять rubric к реальному ролику.
В первом блоке объясняю структуру: тезис, пример, упражнение, обратная связь. Например, если автор обещает научить нейросетям за неделю, это красный флаг, потому что обещание не проверяемо.
Во втором блоке даю практическое задание: возьмите фрагмент на 60 секунд, отметьте источник утверждений, затем оцените ясность слайда и связь речи с визуалом. По данным исследования Mayer 2021, перегруженные слайды снижают удержание материала.
В конце повторим ключевые выводы, дадим чек-лист и предложим следующий шаг: провести аудит своего видео по восьми шкалам.`,
  ocr: "Цель обучения -> пример -> практика -> проверка. Источники: Mayer 2021, Sweller 2019. Чек-лист: структура, доказательность, применимость.",
  segments: [
    { time: "00:00-00:58", type: "теория", note: "Вводит критерии, термины и цель урока" },
    { time: "00:58-01:47", type: "пример", note: "Показывает красный флаг завышенного обещания" },
    { time: "01:47-02:42", type: "практика", note: "Дает задание с источником и проверкой слайдов" },
    { time: "02:42-03:20", type: "вывод", note: "Сводит урок в чек-лист и следующий шаг" }
  ]
};

const dashboardDemo = [
  demo,
  {
    url: "https://www.youtube.com/watch?v=fast-ai-week",
    title: "Стань AI-экспертом за неделю: мотивационный интенсив",
    topic: "AI и машинное обучение",
    transcript: `Сегодня я покажу легкий и быстрый путь с нуля до эксперта за неделю. Подпишись, купи курс со скидкой и повторяй мои шаги. Мы не будем углубляться в термины, главное поверить в себя и действовать без усилий. В конце будет марафон и продажа полного пакета.`,
    ocr: "AI за 7 дней. Скидка. Быстрый результат. Мотивация.",
    audio: 6,
    video: 7,
    slides: 4,
    pace: 6,
    segments: [
      { time: "00:00-00:44", type: "мотивация", note: "Обещает быстрый результат без проверки" },
      { time: "00:44-01:20", type: "продажа", note: "Смещение в оффер и подписку" },
      { time: "01:20-02:10", type: "общие советы", note: "Мало конкретики и источников" }
    ]
  },
  {
    url: "https://www.youtube.com/watch?v=sql-practice-lab",
    title: "SQL JOIN на практике: разбор задачи и проверка результата",
    topic: "Базы данных",
    transcript: `Сначала сформулируем цель: научиться выбирать тип JOIN под задачу. Разберем термины inner join, left join и ключ связи. Затем покажу пример на таблице заказов и клиентов. Практическое задание: напишите запрос, проверьте пустые значения, сравните результат с ожидаемой таблицей. Источник: документация PostgreSQL 2024 и учебный пример из курса баз данных. В конце итог и чек-лист ошибок.`,
    ocr: "INNER JOIN, LEFT JOIN, ключ связи. Задание: запрос -> проверка NULL -> сравнение результата. Источник: PostgreSQL docs 2024.",
    audio: 8,
    video: 8,
    slides: 9,
    pace: 8,
    segments: [
      { time: "00:00-00:50", type: "цель", note: "Четко задает учебный результат" },
      { time: "00:50-01:40", type: "теория", note: "Объясняет термины и принципы JOIN" },
      { time: "01:40-02:35", type: "практика", note: "Дает задание и критерий проверки" },
      { time: "02:35-03:15", type: "вывод", note: "Сводит ошибки в чек-лист" }
    ]
  },
  {
    url: "https://www.youtube.com/watch?v=design-lecture-notes",
    title: "История UX-дизайна: обзор без упражнений",
    topic: "UX и продуктовый дизайн",
    transcript: `В этом ролике расскажу историю UX-дизайна. Сначала поговорим о развитии интерфейсов, затем о переходе к пользовательским исследованиям. Есть несколько примеров продуктов, но практического задания сегодня не будет. Источники упомянуты в описании, в видео они не разбираются. В конце сделаем короткий вывод.`,
    ocr: "История UX. Интерфейсы. Пользовательские исследования. Примеры продуктов.",
    audio: 7,
    video: 7,
    slides: 7,
    pace: 5,
    segments: [
      { time: "00:00-01:00", type: "обзор", note: "Обозначает тему и хронологию" },
      { time: "01:00-02:20", type: "пример", note: "Показывает продукты без упражнений" },
      { time: "02:20-03:00", type: "вывод", note: "Краткое резюме без проверки понимания" }
    ]
  }
];

const state = {
  videos: [],
  selectedVideoId: null,
  popularBenchmark: null,
  popularStatus: "idle",
  popularTopic: "",
  hasLoadedVideo: false,
  videoDescription: "",
  segments: [],
  visualObservations: [],
  mediaAnalysis: null
};

const NOT_AVAILABLE_LABEL = "Not Available";

const els = {
  videoUrl: document.querySelector("#videoUrl"),
  videoTitle: document.querySelector("#videoTitle"),
  videoTopic: document.querySelector("#videoTopic"),
  analysisMode: document.querySelector("#analysisMode"),
  fetchYouTube: document.querySelector("#fetchYouTube"),
  fetchStatus: document.querySelector("#fetchStatus"),
  transcript: document.querySelector("#transcript"),
  ocrText: document.querySelector("#ocrText"),
  segments: document.querySelector("#segments"),
  timecodeAudit: document.querySelector("#timecodeAudit"),
  audioQuality: document.querySelector("#audioQuality"),
  videoQuality: document.querySelector("#videoQuality"),
  slideReadability: document.querySelector("#slideReadability"),
  speechPace: document.querySelector("#speechPace"),
  videoCount: document.querySelector("#videoCount"),
  averageScore: document.querySelector("#averageScore"),
  leaderGrade: document.querySelector("#leaderGrade"),
  riskCount: document.querySelector("#riskCount"),
  topicCount: document.querySelector("#topicCount"),
  rankingTable: document.querySelector("#rankingTable"),
  topicGroups: document.querySelector("#topicGroups"),
  comparisonGrid: document.querySelector("#comparisonGrid"),
  saveVideo: document.querySelector("#saveVideo"),
  exportRatingData: document.querySelector("#exportRatingData"),
  loadDashboardDemo: document.querySelector("#loadDashboardDemo"),
  scaleList: document.querySelector("#scaleList"),
  audienceList: document.querySelector("#audienceList"),
  benchmarkList: document.querySelector("#benchmarkList"),
  popularBenchmark: document.querySelector("#popularBenchmark"),
  riskList: document.querySelector("#riskList"),
  evidenceList: document.querySelector("#evidenceList"),
  transcriptView: document.querySelector("#transcriptView"),
  visualView: document.querySelector("#visualView"),
  ocrView: document.querySelector("#ocrView"),
  score: document.querySelector("#score"),
  grade: document.querySelector("#grade"),
  ratingSummary: document.querySelector("#ratingSummary"),
  radar: document.querySelector("#radar")
};

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function countHits(text, words) {
  const haystack = text.toLowerCase();
  return words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
}

function regexHits(text, patterns) {
  const haystack = String(text || "").toLowerCase();
  return patterns.reduce((sum, pattern) => sum + (pattern.test(haystack) ? 1 : 0), 0);
}

function uniqueTypes(segments = state.segments) {
  return new Set(segments.map((segment) => segment.type.trim().toLowerCase()).filter(Boolean)).size;
}

function getInputs() {
  const transcript = els.transcript.value.trim();
  const ocr = els.ocrText.value.trim();
  const title = els.videoTitle.value.trim();
  const topic = els.videoTopic.value.trim();
  const description = String(state.videoDescription || "").trim();
  const combined = `${title}\n${topic}\n${description}\n${transcript}\n${ocr}`;
  return {
    title,
    topic,
    description,
    transcript,
    ocr,
    combined,
    audio: Number(els.audioQuality.value),
    video: Number(els.videoQuality.value),
    slides: Number(els.slideReadability.value),
    pace: Number(els.speechPace.value)
  };
}

const genericTopicLabels = new Set([
  "",
  "без темы",
  "обучение",
  "образование",
  "методология обучения",
  "учебное видео",
  "обучающий ролик"
]);

const topicRules = [
  {
    id: "physics",
    label: "Физика",
    benchmark: "обучение физике",
    include: [
      [/физик|physics|механик|электродинамик|термодинамик|оптик|квант|ньютон|электричеств|магнетизм|кинематик|динамик/i, "физика"],
      [/егэ\s*(по\s*)?физ|огэ\s*(по\s*)?физ|задач[аи]\s+по\s+физ/i, "экзамен/задачи по физике"]
    ],
    exclude: [/англий|english|ielts|toefl|язык программирован|python|javascript|typescript|нейросет|machine learning|трейдинг|trading|ux|figma/i]
  },
  {
    id: "math",
    label: "Математика",
    benchmark: "обучение математике",
    include: [
      [/математ|math|алгебр|геометр|calculus|тригонометр|производн|интеграл|логарифм|уравнен|теорем|дроб[ьи]/i, "математика"],
      [/егэ\s*(по\s*)?мат|огэ\s*(по\s*)?мат|задач[аи]\s+по\s+мат/i, "экзамен/задачи по математике"]
    ],
    exclude: [/англий|english|ielts|toefl|python|javascript|typescript|нейросет|machine learning|трейдинг|trading|ux|figma/i]
  },
  {
    id: "language",
    label: "Иностранные языки",
    benchmark: "обучение иностранному языку",
    include: [
      [/английск|english|ielts|toefl|grammar|vocabulary|speaking|listening|pronunciation|лексик[аи]|грамматик/i, "английский/языковое обучение"],
      [/немецк|deutsch|испанск|spanish|французск|french|японск|китайск|иностранн[а-я\s]+язык/i, "иностранный язык"]
    ],
    exclude: [/язык программирован|programming language|python|javascript|typescript|react|node|sql|кодинг|код\b|программ|разработк|нейро|нейросет|machine learning|трейдинг|trading|бирж|крипт|физик|математ/i]
  },
  {
    id: "trading",
    label: "Трейдинг и инвестиции",
    benchmark: "обучение трейдингу",
    include: [
      [/трейдинг|trading|бирж|крипт|криптовалют|инвест|акци[ия]|forex|форекс|фьючерс|скальпинг|теханализ|техническ[а-я\s]+анализ/i, "трейдинг/инвестиции"]
    ],
    exclude: [/англий|english|язык программирован|python|javascript|нейросет|machine learning|физик|математ|ux|figma/i]
  },
  {
    id: "database",
    label: "Базы данных",
    benchmark: "обучение SQL",
    include: [
      [/\bsql\b|postgres|mysql|sqlite|баз[аы]\s+данных|database|join|индекс[ыа]?|таблиц[аы]\s+sql/i, "SQL/базы данных"]
    ],
    exclude: [/англий|english|иностранн[а-я\s]+язык|трейдинг|нейросет|физик|математ|ux|figma/i]
  },
  {
    id: "programming",
    label: "Программирование",
    benchmark: "обучение программированию",
    include: [
      [/\bpython\b|\bjavascript\b|\btypescript\b|\breact\b|\bnode\.?js\b|\bhtml\b|\bcss\b|frontend|backend|программирован|кодинг|разработк|алгоритм[ыа]?\s+код|\bide\b|\bgit\b/i, "программирование"],
      [/язык программирован|programming language/i, "язык программирования"]
    ],
    exclude: [/английск|english|ielts|toefl|grammar|vocabulary|немецк|deutsch|испанск|французск|иностранн[а-я\s]+язык|трейдинг|физик|математ|ux|figma/i]
  },
  {
    id: "ux",
    label: "UX и продуктовый дизайн",
    benchmark: "обучение UX дизайну",
    include: [
      [/\bux\b|\bui\b|figma|дизайн интерфейс|продуктов[а-я\s]+дизайн|user research|исследован[а-я\s]+пользовател|прототип|юзабилити/i, "UX/UI дизайн"]
    ],
    exclude: [/англий|english|sql|python|javascript|нейросет|machine learning|трейдинг|физик|математ/i]
  },
  {
    id: "ai",
    label: "AI и машинное обучение",
    benchmark: "обучение нейросетям",
    include: [
      [/\bai\b|\bml\b|machine learning|deep learning|llm|chatgpt|нейро|нейросет|искусственн[а-я\s]+интеллект|машинн[а-я\s]+обучен|больш[а-я\s]+языков[а-я\s]+модел/i, "AI/машинное обучение"]
    ],
    exclude: [/английск|english|ielts|toefl|иностранн[а-я\s]+язык|трейдинг|trading|ux|figma|физик|математ/i]
  },
  {
    id: "marketing",
    label: "Маркетинг и продажи",
    benchmark: "обучение маркетингу",
    include: [
      [/маркетинг|продаж[аи]|воронк[аи]|таргет|smm|реклам[аи]|лидогенерац|оффер|копирайтинг/i, "маркетинг/продажи"]
    ],
    exclude: [/физик|математ|англий|english|python|javascript|нейросет|ux|figma|трейдинг/i]
  },
  {
    id: "learning-methodology",
    label: "Методология обучения",
    benchmark: "методология обучения",
    include: [
      [/методолог[а-я\s]+обучен|педагогик|дидактик|instructional design|learning design|когнитивн[а-я\s]+нагрузк|образовательн[а-я\s]+дизайн|green argus/i, "методология обучения"]
    ],
    exclude: [/математ|физик|англий|english|python|javascript|sql|трейдинг|ux|figma|нейросет/i]
  }
];

function normalizeTopicText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s.+#-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicSourceText(video, key) {
  if (!video) return "";
  if (key === "title") return video.title || "";
  if (key === "manualTopic") return video.topic || "";
  if (key === "description") return `${video.description || ""} ${video.topicSeed || ""}`;
  if (key === "transcript") return video.transcript || "";
  if (key === "ocr") return `${video.ocr || ""} ${mediaAnalysisLines(video.mediaAnalysis).join(" ")}`;
  return "";
}

function specificBenchmark(rule, sources) {
  const text = sources.map((source) => source.text).join(" ");
  if (rule.id === "language") {
    if (/английск|english|ielts|toefl|grammar|vocabulary|speaking|listening|pronunciation/i.test(text)) return "обучение английскому языку";
    if (/немецк|deutsch/i.test(text)) return "обучение немецкому языку";
    if (/испанск|spanish/i.test(text)) return "обучение испанскому языку";
    if (/французск|french/i.test(text)) return "обучение французскому языку";
    if (/японск/i.test(text)) return "обучение японскому языку";
    if (/китайск/i.test(text)) return "обучение китайскому языку";
  }
  if (rule.id === "programming") {
    if (/python/i.test(text)) return "обучение Python";
    if (/javascript|typescript|react|node\.?js/i.test(text)) return "обучение JavaScript";
  }
  return rule.benchmark;
}

function classifyTopic(video = {}) {
  if (video.topicClassification?.id) return video.topicClassification;
  const manualTopic = normalizeTopicText(video.topic);
  const manualTopicIsSpecific = manualTopic && !genericTopicLabels.has(manualTopic);
  const sources = [
    { key: "title", label: "название", weight: 5, text: topicSourceText(video, "title") },
    { key: "manualTopic", label: "поле темы", weight: manualTopicIsSpecific ? 5 : 0, text: topicSourceText(video, "manualTopic") },
    { key: "description", label: "описание/главы", weight: 2.6, text: topicSourceText(video, "description") },
    { key: "ocr", label: "OCR/экран", weight: 2.2, text: topicSourceText(video, "ocr") },
    { key: "transcript", label: "субтитры", weight: 1.4, text: topicSourceText(video, "transcript") }
  ].map((source) => ({ ...source, text: normalizeTopicText(source.text) }));

  const scored = topicRules.map((rule) => {
    let score = 0;
    const evidence = [];
    for (const source of sources) {
      if (!source.weight || !source.text) continue;
      if (rule.exclude.some((pattern) => pattern.test(source.text))) score -= source.weight * 1.25;
      for (const [pattern, label] of rule.include) {
        if (pattern.test(source.text)) {
          score += source.weight;
          evidence.push(`${source.label}: ${label}`);
          break;
        }
      }
    }
    return { ...rule, score, evidence: [...new Set(evidence)] };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0] || { score: 0, evidence: [] };
  const second = scored[1] || { score: 0 };
  const margin = best.score - Math.max(0, second.score);
  if (best.score < 4.5 || (best.score < 7 && margin < 1.6)) {
    return {
      id: "unknown",
      label: "Без темы",
      benchmark: "",
      score: Number(Math.max(0, best.score).toFixed(1)),
      confidence: "низкая",
      evidence: best.evidence.slice(0, 4),
      alternatives: scored.slice(0, 3).map((item) => ({ id: item.id, label: item.label, score: Number(item.score.toFixed(1)) }))
    };
  }

  const confidence = best.score >= 9 && margin >= 3 ? "высокая" : "средняя";
  return {
    id: best.id,
    label: best.label,
    benchmark: specificBenchmark(best, sources),
    score: Number(best.score.toFixed(1)),
    confidence,
    evidence: best.evidence.slice(0, 6),
    alternatives: scored.slice(1, 4).map((item) => ({ id: item.id, label: item.label, score: Number(item.score.toFixed(1)) }))
  };
}

function inferTopic(video) {
  return classifyTopic(video).label;
}

function benchmarkTopicFromText(text) {
  return classifyTopic({ title: text }).benchmark || "";
}

function benchmarkTopic(video) {
  return classifyTopic(video).benchmark || "";
}

function topicKey(video) {
  const classification = classifyTopic(video);
  return classification.id && classification.id !== "unknown"
    ? classification.id
    : normalizeTopicText(video.topic || classification.label || "unknown");
}

function topicLabel(video) {
  const classification = classifyTopic(video);
  return classification.label !== "Без темы" ? classification.label : (video.topic || "Без темы");
}

function apiBase() {
  const configured = window.GREEN_A_CONFIG?.apiBase || window.GREEN_A_API_BASE || localStorage.getItem("GREEN_A_API_BASE");
  if (configured) return String(configured).replace(/\/+$/, "");
  if (location.protocol === "file:") return "http://127.0.0.1:8787";
  if (/\.github\.io$/i.test(location.hostname)) return "https://green-a.onrender.com";
  return location.origin;
}

function setFetchStatus(message, tone = "neutral") {
  els.fetchStatus.textContent = message;
  els.fetchStatus.dataset.tone = tone;
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!contentType.includes("application/json")) {
    const looksLikeHtml = /^\s*</.test(text);
    if (looksLikeHtml) {
      throw new Error(`API вернул HTML-страницу вместо JSON. Сейчас frontend обращается к ${apiBase()}. Если сайт открыт на GitHub Pages, укажите backend Node-сервиса в config.js, например https://green-a.onrender.com.`);
    }
    throw new Error(`API вернул не JSON (${contentType || "без content-type"}).`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("API вернул некорректный JSON.");
  }
}

function visualObservationLines(observations = []) {
  return observations.map((item, index) => (
    `${index + 1}. ${item.time || "без таймкода"} | ${item.evidence || item.type || "визуальное наблюдение"} | ${item.note || ""}${item.thumbnail ? ` | thumbnail: ${item.thumbnail}` : ""}`
  ));
}

function mediaAnalysisLines(media = null) {
  if (!media) return [];
  const rows = [];
  if (media.audio) {
    rows.push(`Аудио: ${media.audio.available ? "проанализировано" : "недоступно"}; оценка ${media.audio.score ?? "н/д"}/10; громкость ${media.audio.meanVolumeDb ?? "н/д"} dB; тишина ${media.audio.silenceRatio ?? "н/д"}. ${(media.audio.warnings || []).join(" ")}`);
  }
  if (media.video) {
    rows.push(`Видео: ${media.video.available ? "проанализировано" : "недоступно"}; оценка ${media.video.score ?? "н/д"}/10; читаемость ${media.video.readabilityScore ?? "н/д"}/10; яркость ${media.video.averageBrightness ?? "н/д"}; контраст ${media.video.averageContrast ?? "н/д"}. ${(media.video.warnings || []).join(" ")}`);
  }
  if (media.ocr) {
    rows.push(`OCR кадров: ${media.ocr.available ? "текст распознан" : "недоступен"}; кадров ${media.ocr.frames?.length || 0}. ${(media.ocr.warnings || []).join(" ")}`);
  }
  return rows.filter((row) => row.trim());
}

function applyYouTubeData(video) {
  const classification = classifyTopic(video);
  els.videoUrl.value = video.url || els.videoUrl.value.trim();
  els.videoTitle.value = video.title || "";
  els.videoTopic.value = video.topic || classification.label;
  els.transcript.value = video.transcript || "";
  state.videoDescription = video.description || "";
  state.visualObservations = Array.isArray(video.visualObservations)
    ? video.visualObservations.map((item) => ({ ...item }))
    : [];
  state.mediaAnalysis = video.mediaAnalysis ? structuredClone(video.mediaAnalysis) : null;
  const visualLines = visualObservationLines(state.visualObservations);
  const mediaLines = mediaAnalysisLines(state.mediaAnalysis);
  els.ocrText.value = [
    video.description ? `Описание YouTube:\n${video.description}` : "",
    classification.label !== "Без темы" ? `\nТематика по данным ролика:\n${classification.label}; уверенность: ${classification.confidence}; признаки: ${(classification.evidence || []).join("; ") || "предметные маркеры не найдены"}` : "\nТематика по данным ролика:\nне определена достаточно надежно",
    mediaLines.length ? `\nМедиа-анализ:\n${mediaLines.join("\n")}` : "",
    visualLines.length ? `\nВизуальные наблюдения по экрану:\n${visualLines.join("\n")}` : "",
    video.source?.signals?.length ? `\nПолученные сигналы без файла:\n${video.source.signals.map((signal) => `- ${signal}`).join("\n")}` : "",
    video.source?.limitations?.length ? `\nОграничения:\n${video.source.limitations.map((item) => `- ${item}`).join("\n")}` : "",
    video.source?.note ? `\nПримечание анализа:\n${video.source.note}` : ""
  ].filter(Boolean).join("\n");
  els.audioQuality.value = video.audio ?? 7;
  els.videoQuality.value = video.video ?? 7;
  els.slideReadability.value = video.slides ?? 6;
  els.speechPace.value = video.pace ?? 8;
  state.segments = Array.isArray(video.segments) && video.segments.length
    ? video.segments.map((segment) => ({ ...segment }))
    : [{ time: "00:00-01:00", type: "данные", note: "Автоматические сегменты не найдены." }];
  state.selectedVideoId = null;
  state.hasLoadedVideo = true;
  renderSegments();
  syncRangeLabels();
  update();
  fetchPopularBenchmark();
}

async function fetchYouTubeData() {
  const url = els.videoUrl.value.trim();
  if (!url) {
    setFetchStatus("Сначала вставьте ссылку на YouTube.", "error");
    return;
  }
  els.fetchYouTube.disabled = true;
  setFetchStatus("Получаю данные без сохранения видеофайла...", "loading");
  try {
    const mode = encodeURIComponent(els.analysisMode.value);
    const response = await fetch(`${apiBase()}/api/youtube?url=${encodeURIComponent(url)}&mode=${mode}`);
    const payload = await readJsonResponse(response);
    if (!response.ok) throw new Error(payload.error || "YouTube не вернул данные.");
    applyYouTubeData(payload);
    const transcriptMessage = payload.source?.transcriptAvailable
      ? `${payload.source.captionType === "automatic" ? "автоматические" : "ручные"} субтитры найдены`
      : "транскрипт не найден";
    const modeMessage = payload.source?.mode === "stream" ? "файл не сохранялся" : "быстрый режим";
    const mediaParts = [
      payload.source?.audioAnalyzed ? "аудио" : "",
      payload.source?.videoAnalyzed ? "видео" : "",
      payload.source?.ocrAnalyzed ? "OCR" : ""
    ].filter(Boolean);
    const mediaMessage = mediaParts.length ? `, медиа-анализ: ${mediaParts.join(" + ")}` : "";
    const visualMessage = payload.visualObservations?.length ? `, визуальных наблюдений: ${payload.visualObservations.length}` : "";
    setFetchStatus(`Готово: ${transcriptMessage}, ${modeMessage}${mediaMessage}${visualMessage}.`, "ok");
  } catch (error) {
    setFetchStatus(`Не получилось получить данные: ${error.message}. Запустите локальный сервер или проверьте ссылку.`, "error");
  } finally {
    els.fetchYouTube.disabled = false;
  }
}

function currentVideoPayload() {
  const draft = {
    title: els.videoTitle.value.trim(),
    topic: els.videoTopic.value.trim(),
    transcript: els.transcript.value.trim(),
    ocr: els.ocrText.value.trim()
  };
  const topicClassification = classifyTopic(draft);
  return {
    id: state.selectedVideoId || crypto.randomUUID(),
    url: els.videoUrl.value.trim(),
    title: els.videoTitle.value.trim() || "Без названия",
    topic: els.videoTopic.value.trim() || topicClassification.label,
    description: String(state.videoDescription || "").trim(),
    topicClassification,
    transcript: els.transcript.value.trim(),
    ocr: els.ocrText.value.trim(),
    audio: Number(els.audioQuality.value),
    video: Number(els.videoQuality.value),
    slides: Number(els.slideReadability.value),
    pace: Number(els.speechPace.value),
    segments: state.segments.map((segment) => ({ ...segment })),
    visualObservations: state.visualObservations.map((item) => ({ ...item })),
    mediaAnalysis: state.mediaAnalysis ? structuredClone(state.mediaAnalysis) : null
  };
}

function calculateScores(video = null) {
  const visualObservations = video ? (video.visualObservations || []) : state.visualObservations;
  const visualText = visualObservationLines(visualObservations).join("\n");
  const visualSignalText = visualObservations
    .map((item) => `${item.evidence || ""} ${item.type || ""} ${item.topic || ""} ${item.source || ""}`)
    .join(" ");
  const inputData = video ? null : getInputs();
  const data = video
    ? {
        title: (video.title || "").trim(),
        topic: (video.topic || "").trim(),
        description: (video.description || "").trim(),
        transcript: (video.transcript || "").trim(),
        ocr: (video.ocr || "").trim(),
        combined: `${video.title || ""}\n${video.topic || ""}\n${video.description || ""}\n${video.transcript || ""}\n${video.ocr || ""}\n${visualText}`,
        audio: Number(video.audio),
        video: Number(video.video),
        slides: Number(video.slides),
        pace: Number(video.pace)
      }
    : { ...inputData, combined: `${inputData.combined}\n${visualText}` };
  const segments = video ? video.segments : state.segments;
  const textLength = data.transcript.length;
  const termHits = countHits(data.combined, ["термин", "модель", "метод", "принцип", "причина", "данные", "исслед"]);
  const exampleHits = countHits(data.combined, ["например", "пример", "кейс", "покажу", "разберем"]);
  const practiceHits = countHits(data.combined, ["задание", "упражнение", "практи", "шаг", "проверь", "чек-лист"]);
  const sourceHits = countHits(data.combined, ["источник", "исслед", "данные", "ссылка", "mayer", "sweller", "202"]);
  const structureHits = countHits(data.combined, ["сначала", "затем", "в конце", "итог", "вывод", "блок", "шаг"]);
  const salesHits = countHits(data.combined, ["купи", "скидка", "подпишись", "продаж", "марафон", "курс со скидкой"]);
  const promiseHits = countHits(data.combined, ["за неделю", "с нуля до эксперта", "гарантир", "легко и быстро", "без усилий"]);
  const types = uniqueTypes(segments);
  const segmentBonus = clamp(segments.length / 4 * 2.2, 0, 2.2);
  const descriptionChapterHits = segments.filter((segment) => segment.source === "description" || /тема из описания youtube/i.test(segment.note || "")).length;
  const mediaSegmentHits = segments.filter((segment) => segment.source === "media" || /видеопоток|видеоряду|длительности ролика/i.test(segment.note || "")).length;
  const practicalChapterHits = segments.filter((segment) => /практи|задани|упраж|демо|пример/i.test(`${segment.type} ${segment.note}`)).length;
  const segmentScores = segments.map((segment) => Number(segment.score)).filter((score) => Number.isFinite(score) && score > 0);
  const segmentQuality = segmentScores.length
    ? segmentScores.reduce((sum, score) => sum + score, 0) / segmentScores.length
    : 0;
  const segmentDepthBonus = segmentQuality ? (segmentQuality - 5) * 0.28 : 0;
  const visualScores = visualObservations.map((item) => Number(item.score)).filter((score) => Number.isFinite(score) && score > 0);
  const visualQuality = visualScores.length
    ? visualScores.reduce((sum, score) => sum + score, 0) / visualScores.length
    : 0;
  const visualInstructionPatterns = [
    /слайд|презентац/i,
    /демонстрац|screen|скрин|запись экрана/i,
    /доска|whiteboard|board/i,
    /(^|[^\p{L}\p{N}_])код([^\p{L}\p{N}_]|$)|python|javascript|typescript|sql|postgres|mysql|терминал|console|ide/iu,
    /таблиц|график|диаграм|chart|table|spreadsheet/i,
    /формул|уравнен|решени[ея]\s+задач|equation|formula/i,
    /схем|mind map|flow|diagram/i,
    /пример|кейс|case study|демо|demo/i,
    /практик|задани|упражн|exercise|assignment|quiz/i
  ];
  const visualInstructionHits = visualInstructionPatterns.reduce((sum, pattern) => sum + (pattern.test(visualSignalText) ? 1 : 0), 0);
  const visualFallbackActive = textLength < 220 && visualObservations.length > 0;
  const visualFallbackBonus = visualFallbackActive ? Math.min(1.4, visualInstructionHits * 0.22 + Math.max(0, visualQuality - 5) * 0.18) : 0;
  const educationalFit = assessEducationalFit(data, segments, {
    exampleHits,
    practiceHits,
    structureHits,
    sourceHits,
    termHits,
    textLength,
    practicalChapterHits,
    visualObservationCount: visualObservations.length,
    visualInstructionHits,
    visualFallbackActive
  });

  const scores = {
    depth: clamp(3 + Math.min(textLength / 900, 2.1) + termHits * 0.55 + sourceHits * 0.35 + segmentDepthBonus + visualFallbackBonus * 0.45 - salesHits * 0.35),
    pedagogy: clamp(2.5 + exampleHits * 0.75 + practiceHits * 0.85 + types * 0.35 + segmentBonus + Math.min(descriptionChapterHits, 6) * 0.18 + Math.max(0, segmentDepthBonus) + visualFallbackBonus * 0.65),
    structure: clamp(2.8 + structureHits * 0.75 + types * 0.6 + segmentBonus + Math.min(descriptionChapterHits, 8) * 0.28 + Math.min(mediaSegmentHits, 8) * 0.12 + (segmentQuality ? 0.35 : 0) + (visualObservations.length ? 0.35 : 0)),
    practice: clamp(2.2 + practiceHits * 1.1 + exampleHits * 0.45 + practicalChapterHits * 0.45 + segments.filter((segment) => /практика|задание|проверка/i.test(`${segment.type} ${segment.evidence || ""}`)).length * 0.35),
    reliability: clamp(2.8 + sourceHits * 1.25 - promiseHits * 1.2 - salesHits * 0.6),
    complexity: clamp(3 + termHits * 0.45 + types * 0.5 + (textLength > 1200 ? 1.1 : 0.4)),
    technical: clamp((data.audio * 0.32) + (data.video * 0.36) + (data.slides * 0.28) + (visualQuality ? Math.max(0, visualQuality - 5) * 0.08 : 0)),
    communication: clamp((data.pace * 0.45) + (data.audio * 0.22) + structureHits * 0.25 + (visualObservations.length ? 0.35 : 0) + 1.2)
  };
  scores.educationalFitScore = educationalFit.score;

  return { scores, data, flags: { salesHits, promiseHits, sourceHits, practiceHits, textLength, educationalFit, segmentQuality, visualQuality, visualObservationCount: visualObservations.length, visualFallbackActive } };
}

function analyzeVideo(video) {
  const { scores, flags, data } = calculateScores(video);
  const total = flags.educationalFit.exclude ? null : weightedTotal(scores);
  const risks = buildRisks(scores, flags, data);
  return {
    ...video,
    scores,
    total,
    grade: flags.educationalFit.exclude ? "N/A" : gradeFor(total),
    educationalFit: flags.educationalFit,
    risks,
    riskTotal: risks.filter(([level]) => level !== "low").length
  };
}

function assessEducationalFit(data = {}, segments = [], signals = {}) {
  const description = String(data.description || "").toLowerCase();
  const transcriptText = String(data.transcript || "").toLowerCase();
  const text = `${data.title || ""}\n${data.topic || ""}\n${description}\n${transcriptText}`.toLowerCase();
  const title = (data.title || "").toLowerCase();
  const titleAndTopic = `${data.title || ""} ${data.topic || ""}`.toLowerCase();
  const segmentText = segments.map((segment) => `${segment.type || ""} ${segment.note || ""}`).join(" ").toLowerCase();

  const titleEducationHits = regexHits(titleAndTopic, [
    /(^|\s)(урок|лекци[яи]|курс|семинар|вебинар|tutorial|lesson|lecture|course|guide)(\s|$)/i,
    /обуч|учеб|науч|изуч|разбер|объясн|решаем|решени[ея]|практик|тренаж[её]р|гайд|guide|walkthrough/i
  ]);

  const subjectMatterHits = regexHits(`${titleAndTopic} ${text}`, [
    /математ|алгебр|геометр|calculus|физик|хими|биологи|истори[яи]|географ/i,
    /англий|english|grammar|vocabulary|ielts|toefl|немец|deutsch|испан|француз|япон|китай/i,
    /python|javascript|typescript|react|node|sql|postgres|программ|кодинг|разработк|баз[аы]\s+данных|ux|ui|figma|trading|трейдинг/i
  ]);

  const formatHits = countHits(text, ["обуч", "учеб", "урок", "курс", "лекция", "семинар", "объясн", "tutorial", "lesson", "course", "learning", "гайд", "guide", "walkthrough", "how to"]);
  const methodHits = countHits(text, [
    "разберем", "разбираем", "решим", "решаем", "покажу как", "пошаг", "разбор", "пример", "кейс", "формула", "алгоритм", "метод",
    "explain", "explained", "define", "definition", "step by step", "walkthrough", "demo", "demonstration", "solve", "solution"
  ]);
  const practiceOrCheckHits = countHits(text, [
    "задание", "упражнение", "практик", "проверь", "проверка", "тест", "practice", "exercise", "quiz", "assignment", "homework", "check your answer"
  ]);
  const goalHits = countHits(text, [
    "цель урока", "цель обучения", "упр", "результат обучения", "вы научитесь", "навык",
    "learning objective", "goal of the lesson", "you will learn", "by the end of this lesson"
  ]);

  const hardNonLearningHits = countHits(text, [
    "интервью", "беседа", "подкаст", "новости", "реакция", "vlog", "развлекатель",
    "документальный", "обзор", "биография", "размышления", "мнение", "opinion", "ток-шоу",
    "реклама", "реклам", "пранк", "юмор", "концерт", "клип", "стрим", "трансляция", "игра", "игровой"
  ]);
  const titleMediaMarkers = regexHits(title, [
    /official\s+video|music\s+video|lyrics|4k\s+remaster|\blive\b|feat\.?/i,
    /гость программы|школа злословия|концерт|клип|официальн(ый|ое)\s+клип/i
  ]);

  const motivationalMarkers = countHits(text, [
    "верь в себя", "поверить в себя", "верьте в себя", "можешь ты", "сможешь ты", "будешь успешн",
    "преуспев", "разбогатеть", "заработай", "зарабатывай", "работает у нас", "работает со мной",
    "система работает", "это работает", "я докажу"
  ]);

  const quickPromiseMarkers = countHits(text, [
    "за неделю", "за день", "за час", "за 30 дней", "за 7 дней",
    "быстро", "быстрый", "в кратчайшие", "мгновенно", "сразу же",
    "простой способ", "легкий путь", "без усилий", "без работы", "легко и просто"
  ]);

  const salesPushMarkers = countHits(text, [
    "купи", "купить", "заказ", "заказать", "подпишись", "подписывайтесь", "лайки",
    "скидка", "скидку", "бонус", "подарок", "осталось мест", "спешите",
    "ограниченное предложение", "только сегодня", "только для вас", "эксклюзивно"
  ]);

  const guaranteeMarkers = countHits(text, [
    "гарантиров", "обещаю", "обещание", "научу за", "научишься за", "научу", "научиться",
    "станьте экспертом", "станешь экспертом", "эксперт за", "профессионал за", "эксперта за",
    "результат за", "успех за", "деньги назад", "путь до эксперта", "путь к успеху", "станет"
  ]);

  const hasLearningSegments = /практи|задани|упраж|пример|разбор|провер|exercise|assignment|example|practice|step by step|walkthrough/i.test(segmentText);
  const hasChapterStructure = segments.filter((s) => s.source === "description").length >= 3;
  const hasCaptionStructure = segments.filter((s) => s.source === "captions").length >= 3;
  const hasSegmentedLearningFlow = segments.length >= 3 && hasLearningSegments;
  const hasVisualStructure = signals.visualObservationCount >= 2;
  const hasVisualTeachingCore = hasVisualStructure && signals.visualInstructionHits > 1;
  const hasLectureFormat = /лекци|lecture|chapter|глава|серия|часть|модуль|course|курс/i.test(text);
  const hasCourseLikeStructure = hasChapterStructure || hasCaptionStructure || hasSegmentedLearningFlow;
  const hasHowToTitle = /(^|\s)как\s+(сделать|решить|настроить|использовать|выучить|понять|работает|работать)\b/i.test(title);
  const titleTeachingHits = regexHits(title, [/урок|лекци|tutorial|lesson|course|обуч|разбор|гайд|guide|how to/i]);
  const descriptionTeachingHits = countHits(description, [
    "цель урока", "вы научитесь", "пошаг", "разбор", "пример", "упражнение", "задание", "practice", "exercise", "lesson plan", "learning objective"
  ]);
  const transcriptTeachingHits = countHits(transcriptText, [
    "цель урока", "вы научитесь", "пошаг", "разбор", "пример", "упражнение", "задание", "проверка", "practice", "exercise", "assignment", "quiz", "step by step"
  ]);
  const totalTeachingEvidence = titleTeachingHits + Math.min(3, descriptionTeachingHits) + Math.min(4, transcriptTeachingHits) + (hasCourseLikeStructure ? 1 : 0);

  const hasInstructionalFormat = formatHits > 0 || /урок|курс|обуч|tutorial|lesson|course/i.test(title) || hasHowToTitle;
  const explicitEducationalTitle = /урок|лекци|tutorial|lesson|course|обуч|разбор|гайд|guide|how to/i.test(title);
  const talkShowTitle = /гость программы|ток-шоу|подкаст|интервью|шоу/i.test(title);
  const hasMethod = methodHits > 0 || hasLearningSegments;
  const hasPractice = practiceOrCheckHits > 0 && !/нет[^.\n]{0,35}практик|без\s+практик|no\s+practice|without\s+practice/i.test(text);
  const hasGoal = goalHits > 0 && !/нет[^.\n]{0,35}цел[ьи]|без\s+цели|no\s+clear\s+goal|without\s+goal/i.test(text);
  const mechanicsCount = [hasMethod, hasPractice, hasGoal, hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore].filter(Boolean).length;

  const hasOutcomeSignal = hasPractice || hasGoal || hasChapterStructure || hasSegmentedLearningFlow;
  const hasStrongTeachingCore = (hasMethod && hasGoal) || (hasPractice && (hasMethod || hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore));
  const hasEducationalIntent = titleEducationHits > 0 || formatHits >= 1 || (subjectMatterHits > 0 && (hasInstructionalFormat || hasMethod || hasLectureFormat || hasCourseLikeStructure));
  const hasEducationalMechanics = hasMethod || hasPractice || hasGoal || hasCourseLikeStructure || hasLectureFormat || hasVisualTeachingCore;
  const hasEducationalSignal = hasStrongTeachingCore || (hasEducationalIntent && hasEducationalMechanics && mechanicsCount >= 1);

  const learningEvidence = [hasInstructionalFormat, hasMethod, hasPractice, hasGoal, hasChapterStructure || hasCaptionStructure || hasSegmentedLearningFlow, mechanicsCount >= 2].filter(Boolean).length;

  const score = Math.max(0, Math.min(10,
    2.2 +
    (hasInstructionalFormat ? 1.6 : 0) +
    (hasMethod ? 1.8 : 0) +
    (hasPractice ? 1.4 : 0) +
    (hasGoal ? 1.2 : 0) +
    (hasChapterStructure ? 1.0 : 0) +
    (hasSegmentedLearningFlow ? 0.8 : 0) +
    (mechanicsCount >= 2 ? 0.8 : 0) +
    (hasEducationalIntent ? 0.7 : 0) +
    (hasHowToTitle ? 0.8 : 0) +
    (subjectMatterHits > 0 ? 0.4 : 0) +
    (hasVisualTeachingCore ? 0.3 : 0) -
    (hardNonLearningHits ? Math.min(hardNonLearningHits, 3) * 0.65 : 0) -
    (salesPushMarkers >= 3 ? 0.7 : 0)
  ));

  const strongInfotainment = (hardNonLearningHits >= 2 || titleMediaMarkers > 0) && mechanicsCount === 0 && !hasEducationalMechanics;
  const onlyHomeworkOrViewing = hasPractice && !hasEducationalSignal && /домашнее задание|приятного просмотра/i.test(text);

  const isSelfHelpMotivational = (motivationalMarkers >= 2 || quickPromiseMarkers >= 3) && mechanicsCount === 0;
  const isSalesHeavy = salesPushMarkers >= 3 && mechanicsCount < 2;
  const hasOverpromising = (guaranteeMarkers >= 2 || quickPromiseMarkers >= 4) && mechanicsCount === 0;
  const isAggressiveMarketing = quickPromiseMarkers >= 4 && salesPushMarkers >= 3 && mechanicsCount === 0;
  const noTeachingMechanism = mechanicsCount === 0;
  const isOverviewWithoutTeachingCore = /обзор|review|discussion|react/i.test(text) && !hasGoal && !hasPractice && !hasChapterStructure;
  const isSalesLeadWithoutPractice = salesPushMarkers >= 1 && !hasPractice && !hasGoal && !hasCourseLikeStructure;
  const isCourseOverviewSales = /курс|course/i.test(text) && /обзор|review/i.test(text) && !hasOutcomeSignal && salesPushMarkers >= 1;
  const hardNegativeCount = [
    strongInfotainment,
    onlyHomeworkOrViewing,
    isSelfHelpMotivational,
    isSalesHeavy,
    hasOverpromising,
    isAggressiveMarketing,
    isOverviewWithoutTeachingCore,
    isSalesLeadWithoutPractice
  ].filter(Boolean).length;

  const nonEducational = score < 2.8 ||
    (talkShowTitle && !explicitEducationalTitle) ||
    (!hasEducationalSignal && totalTeachingEvidence <= 1 && hardNonLearningHits >= 1) ||
    (!hasStrongTeachingCore && score < 4.2 && (isOverviewWithoutTeachingCore || hardNonLearningHits > 0 || learningEvidence <= 1)) ||
    ((hardNonLearningHits >= 3 && titleMediaMarkers > 0) && !hasChapterStructure) ||
    ((hardNonLearningHits >= 3 || titleMediaMarkers > 0) && !hasOutcomeSignal && !hasStrongTeachingCore) ||
    (noTeachingMechanism && learningEvidence <= 1 && (hardNonLearningHits >= 2 || hardNegativeCount >= 2)) ||
    (motivationalMarkers >= 2 && quickPromiseMarkers >= 2 && salesPushMarkers >= 2) ||
    (salesPushMarkers >= 3 && guaranteeMarkers >= 2) ||
    (isCourseOverviewSales && !hasOutcomeSignal) ||
    ((isSalesHeavy || isSelfHelpMotivational || isAggressiveMarketing || isOverviewWithoutTeachingCore || isSalesLeadWithoutPractice || isCourseOverviewSales) && !hasEducationalSignal);
  const educational = !nonEducational && (
    (score >= 6 && mechanicsCount >= 2 && hasEducationalSignal && hasOutcomeSignal && hardNonLearningHits < 3 && titleMediaMarkers === 0) ||
    (score >= 5.2 && titleTeachingHits >= 1 && descriptionTeachingHits >= 2 && hardNonLearningHits < 3 && !isSalesHeavy) ||
    (score >= 5.2 && hasStrongTeachingCore && learningEvidence >= 3 && hardNegativeCount <= 1)
  );
  const uncertain = !nonEducational && !educational;
  const exclude = nonEducational;
  const eligible = educational;
  const weak = uncertain;
  const classification = nonEducational ? "non-educational" : (educational ? "educational" : "uncertain");
  const confidence = educational
    ? (score >= 7 && hardNegativeCount === 0 ? "high" : "medium")
    : (uncertain ? (score >= 5 ? "medium" : "low") : "low");

  const reasons = [];
  if (hardNonLearningHits) reasons.push(`медийные маркеры: ${hardNonLearningHits}`);
  if (titleMediaMarkers) reasons.push(`медийные маркеры в названии: ${titleMediaMarkers}`);
  if (motivationalMarkers >= 2) reasons.push(`мотивационный контент: ${motivationalMarkers}`);
  if (quickPromiseMarkers >= 3) reasons.push(`обещания быстрого результата: ${quickPromiseMarkers}`);
  if (salesPushMarkers >= 3) reasons.push(`агрессивные продажи: ${salesPushMarkers}`);
  if (guaranteeMarkers >= 2) reasons.push(`гарантии и переуспевание: ${guaranteeMarkers}`);
  if (!hasEducationalSignal) reasons.push("видео не имеет достаточной учебной структуры или цели");
  if (isSalesHeavy) reasons.push("контент перегружен продажами вместо обучения");
  if (hasOverpromising) reasons.push("видео содержит завышенные обещания без методологии");
  if (isSelfHelpMotivational) reasons.push("контент мотивационный, без конкретной методики и практики");
  if (noTeachingMechanism) reasons.push("недостаточно учебной механики: нет цели/метода/практики");
  if (isOverviewWithoutTeachingCore) reasons.push("обзорный формат без явной учебной цели и практики");
  if (isSalesLeadWithoutPractice) reasons.push("продвижение курса преобладает над учебной частью");
  if (isCourseOverviewSales) reasons.push("обзор курса с оффером без учебной практики/цели");
  if (uncertain) reasons.push("пограничный случай: нужны дополнительные подтверждения учебной механики");
  if (exclude) reasons.push("не хватает признаков обучающего формата или преобладает медийно-маркетинговая подача");

  return {
    eligible,
    weak,
    uncertain,
    exclude,
    classification,
    confidence,
    score: Number(score.toFixed(1)),
    learningEvidence,
    reasons,
    markers: {
      hardNonLearningHits,
      titleMediaMarkers,
      motivationalMarkers,
      quickPromiseMarkers,
      salesPushMarkers,
      guaranteeMarkers
    }
  };
}

function weightedTotal(scores) {
  const raw = rawWeightedTotal(scores);
  const cap = majorQualityCap(scores);
  const educationalCap = educationalFitCap(scores);
  return [cap?.max, educationalCap?.max]
    .filter((value) => Number.isFinite(value))
    .reduce((value, max) => Math.min(value, max), raw);
}

function rawWeightedTotal(scores) {
  return Math.round(scales.reduce((sum, scale) => sum + scores[scale.id] * scale.weight, 0) / 10);
}

function majorQualityProfile(scores) {
  const values = {
    depth: Number(scores.depth || 0),
    pedagogy: Number(scores.pedagogy || 0),
    structure: Number(scores.structure || 0),
    reliability: Number(scores.reliability || 0)
  };
  const weighted = (
    values.depth * 0.32 +
    values.pedagogy * 0.25 +
    values.structure * 0.22 +
    values.reliability * 0.21
  );
  const weak = Object.entries(values)
    .filter(([, value]) => value < 4.5)
    .map(([key]) => key);
  return { values, weak, weighted };
}

function majorQualityCap(scores) {
  const profile = majorQualityProfile(scores);
  const core = profile.weighted;
  if (core < 3.5) return { max: 45, grade: "E", reason: "методологическое ядро ниже 3.5/10" };
  if (core < 4.5) return { max: 58, grade: "D", reason: "методологическое ядро ниже 4.5/10" };
  if (core < 5.5) return { max: 70, grade: "B", reason: "методологическое ядро ниже 5.5/10" };
  if (profile.weak.length >= 3) return { max: 66, grade: "C", reason: "слабые сразу несколько ключевых шкал: глубина, педагогика, структура или достоверность" };
  if (core < 6.5) return { max: 82, grade: "B", reason: "методологическое ядро ниже 6.5/10" };
  if (profile.weak.length >= 2) return { max: 78, grade: "B", reason: "две ключевые шкалы ниже рабочего порога" };
  return null;
}

function ratingCapNote(scores) {
  const raw = rawWeightedTotal(scores);
  const notes = [majorQualityCap(scores), educationalFitCap(scores)]
    .filter((cap) => cap && raw > cap.max)
    .map((cap) => `до ${cap.max}: ${cap.reason}`);
  if (!notes.length) return "";
  return `Итог ограничен ${notes.join("; ")}. Без ограничений взвешенная сумма была бы ${raw}.`;
}

function educationalFitCap(scores) {
  const fit = scores.educationalFitScore;
  if (!Number.isFinite(fit)) return null;
  const core = majorQualityProfile(scores).weighted;
  if (fit < 4.5) return { max: 62, reason: "слабые признаки учебного формата" };
  if (fit < 5.5) return { max: core >= 6.5 ? 78 : 70, reason: "обучающий формат выражен умеренно" };
  if (fit < 6.2 && core < 6.5) return { max: 82, reason: "обучающий формат требует подтверждения сильным методологическим ядром" };
  return null;
}

function gradeFor(score) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

function summaryFor(score) {
  if (score >= 85) return "Сильный учебный ролик: есть глубина, структура, практика и доказательность.";
  if (score >= 70) return "Хорошее обучающее видео с заметными зонами усиления.";
  if (score >= 55) return "Средний учебный материал: полезен, но требует доработки методики и доказательств.";
  if (score >= 40) return "Слабое обучение: есть фрагменты пользы, но риски перевешивают.";
  return "Материал плохо подходит для обучения: нужны пересборка структуры, доказательность и техника.";
}

function parseTimeValue(value) {
  const parts = value.trim().split(":").map(Number);
  if (!parts.length || parts.length > 3 || parts.some((part) => Number.isNaN(part) || part < 0)) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function parseTimeRange(value) {
  const normalized = value.replace(/[–—]/g, "-");
  const parts = normalized.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  const start = parseTimeValue(parts[0]);
  const end = parseTimeValue(parts[1]);
  if (start === null || end === null) return null;
  return { start, end, duration: end - start };
}

function validateTimecodes() {
  const issues = [];
  const parsed = state.segments.map((segment, index) => ({
    index,
    segment,
    range: parseTimeRange(segment.time)
  }));

  parsed.forEach((item) => {
    if (!item.range) {
      issues.push({ level: "high", index: item.index, title: "Неверный формат", body: `Сегмент ${item.index + 1}: используйте формат 00:00-01:00 или 01:02:03-01:03:10.` });
      return;
    }
    if (item.range.duration <= 0) {
      issues.push({ level: "high", index: item.index, title: "Нулевая или обратная длительность", body: `Сегмент ${item.index + 1}: конец должен быть позже начала.` });
    } else if (item.range.duration < 30) {
      issues.push({ level: "medium", index: item.index, title: "Слишком короткий фрагмент", body: `Сегмент ${item.index + 1}: ${Math.round(item.range.duration)} сек., желательно 30-90 сек.` });
    } else if (item.range.duration > 90) {
      issues.push({ level: "medium", index: item.index, title: "Слишком длинный фрагмент", body: `Сегмент ${item.index + 1}: ${Math.round(item.range.duration)} сек., желательно 30-90 сек.` });
    }
  });

  for (let index = 1; index < parsed.length; index += 1) {
    const previous = parsed[index - 1].range;
    const current = parsed[index].range;
    if (!previous || !current) continue;
    const gap = current.start - previous.end;
    if (current.start < previous.start) {
      issues.push({ level: "high", index, title: "Нарушен порядок", body: `Сегмент ${index + 1} начинается раньше предыдущего.` });
    } else if (gap < -1) {
      issues.push({ level: "high", index, title: "Пересечение", body: `Сегменты ${index} и ${index + 1} пересекаются на ${Math.abs(Math.round(gap))} сек.` });
    } else if (gap > 8) {
      issues.push({ level: "medium", index, title: "Пропуск между фрагментами", body: `Между сегментами ${index} и ${index + 1} пропуск ${Math.round(gap)} сек.` });
    }
  }

  return issues;
}

function renderTimecodeAudit() {
  const issues = validateTimecodes();
  els.segments.querySelectorAll(".segment-card").forEach((card, index) => {
    const level = issues.find((issue) => issue.index === index)?.level;
    card.classList.toggle("invalid", level === "high");
    card.classList.toggle("warning", level === "medium");
  });
  if (!state.segments.length) {
    els.timecodeAudit.innerHTML = `<div class="audit-ok">Добавьте сегменты, чтобы проверить таймкоды.</div>`;
    return;
  }
  if (!issues.length) {
    els.timecodeAudit.innerHTML = `<div class="audit-ok"><strong>Таймкоды согласованы</strong><span>Формат, порядок и длительность 30-90 секунд выглядят корректно.</span></div>`;
    return;
  }
  els.timecodeAudit.innerHTML = issues.slice(0, 8).map((issue) => `
    <article class="audit-issue ${issue.level}">
      <strong>${escapeHtml(issue.title)}</strong>
      <span>${escapeHtml(issue.body)}</span>
    </article>
  `).join("");
}

function renderSegments() {
  els.segments.innerHTML = "";
  state.segments.forEach((segment, index) => {
    const card = document.createElement("article");
    card.className = "segment-card";

    const timeLabel = document.createElement("label");
    const timeLabelName = document.createElement("span");
    timeLabelName.textContent = "Таймкод";
    const timeInput = document.createElement("input");
    timeInput.value = String(segment.time || "");
    timeInput.dataset.field = "time";
    timeInput.dataset.index = String(index);
    timeInput.placeholder = "00:00-01:00";
    timeLabel.append(timeLabelName, timeInput);

    const typeLabel = document.createElement("label");
    const typeLabelName = document.createElement("span");
    typeLabelName.textContent = "Тип";
    const typeInput = document.createElement("input");
    typeInput.value = String(segment.type || "");
    typeInput.dataset.field = "type";
    typeInput.dataset.index = String(index);
    typeInput.placeholder = "теория";
    typeLabel.append(typeLabelName, typeInput);

    const noteLabel = document.createElement("label");
    const noteLabelName = document.createElement("span");
    noteLabelName.textContent = "Наблюдение";
    const noteInput = document.createElement("input");
    noteInput.value = String(segment.note || "");
    noteInput.dataset.field = "note";
    noteInput.dataset.index = String(index);
    noteInput.placeholder = "пример, источник, упражнение";
    noteLabel.append(noteLabelName, noteInput);

    const score = Number(segment.score);
    const meta = document.createElement("span");
    meta.className = "segment-meta";
    if (Number.isFinite(score)) {
      meta.append("Оценка сегмента ");
      const strong = document.createElement("b");
      strong.textContent = score.toFixed(1);
      meta.append(strong, ` · ${segment.evidence || segment.source || "авто"}`);
    } else {
      meta.textContent = segment.source || "ручной сегмент";
    }

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", "Удалить сегмент");
    removeButton.dataset.remove = String(index);
    removeButton.textContent = "×";

    card.append(timeLabel, typeLabel, noteLabel, meta, removeButton);
    els.segments.appendChild(card);
  });
  renderTimecodeAudit();
}

function renderScales(scores) {
  els.scaleList.innerHTML = "";
  scales.forEach((scale) => {
    const value = scores[scale.id];
    const row = document.createElement("div");
    row.className = "scale-row";
    row.innerHTML = `
      <div class="scale-label"><span>${scale.label}</span><span>${scale.weight}%</span></div>
      <strong>${value.toFixed(1)}</strong>
      <div class="bar"><i style="width:${value * 10}%"></i></div>
    `;
    els.scaleList.appendChild(row);
  });
}

function audienceFit(scores, flags, data) {
  const termDensity = countHits(data.combined, ["термин", "модель", "метод", "алгоритм", "архитект", "исслед", "данные", "код"]);
  const beginner = clamp(
    2.4
    + scores.structure * 0.28
    + scores.communication * 0.28
    + scores.pedagogy * 0.22
    + (scores.complexity < 5.8 ? 1.2 : -0.9)
    + (termDensity <= 3 ? 0.8 : -0.7)
    - flags.promiseHits * 0.7
  );
  const intermediate = clamp(
    2.1
    + scores.practice * 0.32
    + scores.pedagogy * 0.24
    + scores.depth * 0.18
    + scores.structure * 0.16
    + (scores.complexity >= 4.5 && scores.complexity <= 7.8 ? 1.0 : -0.4)
  );
  const professional = clamp(
    1.6
    + scores.depth * 0.34
    + scores.reliability * 0.24
    + scores.complexity * 0.26
    + (termDensity >= 4 ? 0.9 : -0.5)
    + (scores.practice >= 7 ? 0.4 : 0)
  );
  return [
    {
      id: "beginner",
      label: "Новички",
      score: beginner,
      reason: beginner >= 7
        ? "Хорошая структура, понятная коммуникация и умеренная сложность."
        : "Может потребоваться вводный контекст или более мягкое объяснение терминов."
    },
    {
      id: "intermediate",
      label: "Средний уровень",
      score: intermediate,
      reason: intermediate >= 7
        ? "Есть баланс объяснений, примеров и практического применения."
        : "Не хватает упражнений, примеров или постепенного наращивания сложности."
    },
    {
      id: "professional",
      label: "Профессиональное сообщество",
      score: professional,
      reason: professional >= 7
        ? "Достаточно глубины, терминологии и проверяемых утверждений."
        : "Для профессионалов может быть мало глубины, источников или спорных деталей."
    }
  ].sort((a, b) => b.score - a.score);
}

function renderAudience(scores, flags, data) {
  const rows = audienceFit(scores, flags, data);
  els.audienceList.innerHTML = "";
  rows.forEach((row, index) => {
    const item = document.createElement("article");
    item.className = `audience-card${index === 0 ? " best" : ""}`;
    item.innerHTML = `
      <span class="audience-head">
        <strong>${escapeHtml(row.label)}</strong>
        <b>${row.score.toFixed(1)}</b>
      </span>
      <span class="bar"><i style="width:${row.score * 10}%"></i></span>
      <p>${escapeHtml(row.reason)}</p>
    `;
    els.audienceList.appendChild(item);
  });
}

function buildRisks(scores, flags, data) {
  const risks = [];
  if (flags.educationalFit.exclude) {
    risks.push(["high", "Не классифицировано как обучающее видео", `По описанию и содержанию не хватает учебной механики: цели, шагов, практики или проверки понимания. ${flags.educationalFit.reasons.join("; ")}.`]);
    return risks;
  }
  if (flags.educationalFit.weak) risks.push(["medium", "Пограничный обучающий формат", `Видео частично похоже на обучающее, но признаков учебной механики пока недостаточно для высокой уверенности. Оценка формата: ${flags.educationalFit.score}/10.`]);
  const majorProfile = majorQualityProfile(scores);
  if (majorProfile.weighted < 5) {
    risks.push(["high", "Слабое методологическое ядро", "Итог ограничен не одной глубиной, а связкой ключевых шкал: содержательность, педагогика, структура и достоверность."]);
  } else if (majorProfile.weighted < 6.5 || majorProfile.weak.length) {
    const weakLabels = {
      depth: "глубина",
      pedagogy: "педагогика",
      structure: "структура",
      reliability: "достоверность"
    };
    const weakText = majorProfile.weak.map((key) => weakLabels[key]).join(", ");
    risks.push(["medium", "Ключевые шкалы требуют усиления", weakText ? `Ниже рабочего порога: ${weakText}.` : "Методологическое ядро пока не дотягивает до A-класса."]);
  }
  if (flags.promiseHits > 0) risks.push(["high", "Завышенные обещания", "Найдены формулировки вроде быстрого гарантированного результата. Это снижает доверие к образовательной ценности."]);
  if (flags.salesHits > 0) risks.push(["medium", "Смещение в продажи", "В транскрипте есть маркетинговые маркеры. Проверьте, не подменяется ли обучение мотивацией или оффером."]);
  if (flags.sourceHits === 0) risks.push(["high", "Нет явных источников", "Утверждения не подкреплены источниками, данными или проверяемыми ссылками."]);
  if (scores.technical < 5) risks.push(["high", "Техническая непригодность", "Суммарная оценка звука, видео и читаемости ниже рабочего порога."]);
  if (flags.practiceHits === 0) risks.push(["medium", "Мало практики", "Не найдено явных упражнений, заданий или проверок понимания."]);
  if (data.transcript.length < 250) risks.push(["medium", "Недостаточно данных", "Транскрипт короткий, поэтому выводы стоит считать предварительными."]);
  return risks.length ? risks : [["low", "Критических флагов нет", "По текущим данным агент не обнаружил грубых методологических или технических рисков."]];
}

function renderRisks(risks) {
  els.riskList.innerHTML = "";
  risks.forEach(([level, title, body]) => {
    const item = document.createElement("article");
    item.className = `risk ${level}`;
    const heading = document.createElement("strong");
    heading.textContent = title;
    const text = document.createElement("p");
    text.textContent = body;
    item.append(heading, text);
    els.riskList.appendChild(item);
  });
}

function renderEvidence(scores, flags = null) {
  const rows = state.segments.slice(0, 6).map((segment) => {
    const note = segment.note || "Сегмент учтен в общей структуре, но требует ручного наблюдения.";
    return [`${segment.time} · ${segment.type}`, note];
  });
  if (flags?.educationalFit?.exclude) {
    rows.push(["Классификация", `Видео исключено из рейтинга как не обучающее. Причины: ${flags.educationalFit.reasons.join("; ")}.`]);
  } else if (flags?.educationalFit?.weak) {
    rows.push(["Классификация", `Видео отмечено как погранично обучающее. Оценка формата: ${flags.educationalFit.score}/10. Причины: ${flags.educationalFit.reasons.join("; ")}.`]);
  }
  if (flags?.visualObservationCount) {
    rows.push(["Визуальный слой", `Учтено визуальных наблюдений: ${flags.visualObservationCount}. ${flags.visualFallbackActive ? "Транскрипт слабый или отсутствует, поэтому экран влияет на оценку сильнее." : "Экран используется как дополнительное доказательство к речи и сегментам."}`]);
  }
  const capNote = ratingCapNote(scores);
  if (capNote) rows.push(["Потолок рейтинга", capNote]);
  rows.push(["Сводка шкал", `Максимальные зоны: ${topScales(scores).join(", ")}.`]);
  els.evidenceList.innerHTML = "";
  rows.forEach(([title, body]) => {
    const item = document.createElement("article");
    item.className = "evidence";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const text = document.createElement("p");
    text.textContent = body;
    item.append(heading, text);
    els.evidenceList.appendChild(item);
  });
}

function buildRatingPrompt(video, scores, flags, risks) {
  const topicInfo = video.topicClassification || classifyTopic(video);
  const scaleLines = scales.map((scale) => {
    const score = scores[scale.id]?.toFixed ? scores[scale.id].toFixed(1) : scores[scale.id];
    return `- ${scale.label}: вес ${scale.weight}%, текущая оценка ${score}/10`;
  }).join("\n");
  const segmentLines = video.segments.map((segment, index) => (
    `${index + 1}. ${segment.time} | ${segment.type} | ${segment.topic || ""} | ${segment.evidence || ""} | ${segment.note || ""}`
  )).join("\n");
  const visualLines = visualObservationLines(video.visualObservations || []).join("\n");
  const mediaLines = mediaAnalysisLines(video.mediaAnalysis).join("\n");
  const riskLines = risks.map(([level, title, body]) => `- [${level}] ${title}: ${body}`).join("\n");
  return `Ты эксперт по методологии Green Argus Index. Оцени образовательный YouTube-ролик только по данным ниже, не учитывая внешнюю репутацию автора, харизму или маркетинговые обещания.

ЗАДАЧА:
1. Проверь, является ли ролик обучающим, а не просто познавательным или развлекательным.
2. Оцени 8 шкал от 0 до 10.
3. Привяжи аргументы к сегментам и таймкодам.
4. Найди красные флаги.
5. Верни итоговый рейтинг 0-100 и класс A-E.
6. Если транскрипт отсутствует или ролик фактически без звука, оцени обучение по визуальному ряду: что видно на экране, есть ли объясняющие действия, слайды/доска/код/формулы, читаемость, пошаговость и связь визуала с учебной задачей.

ВЕСА ШКАЛ:
${scaleLines}

ВИДЕО:
URL: ${video.url}
Название: ${video.title}
Тематика: ${video.topic}
Определение тематики: ${topicInfo.label}; уверенность ${topicInfo.confidence}; признаки: ${(topicInfo.evidence || []).join("; ") || "нет надежных предметных маркеров"}
Режим анализа: ${els.analysisMode.value}

ТЕКУЩИЙ РАСЧЕТ:
Итог: ${flags.educationalFit.exclude ? NOT_AVAILABLE_LABEL : weightedTotal(scores)}
Класс: ${flags.educationalFit.exclude ? "N/A" : gradeFor(weightedTotal(scores))}
Оценка обучающего формата: ${flags.educationalFit.score}/10
Причины классификации: ${flags.educationalFit.reasons.join("; ")}

СЕГМЕНТЫ:
${segmentLines || "Сегменты не найдены."}

ВИЗУАЛЬНЫЕ НАБЛЮДЕНИЯ ПО ЭКРАНУ:
${visualLines || "Визуальные наблюдения отсутствуют."}

МЕДИА-АНАЛИЗ:
${mediaLines || "Медиа-анализ аудио/видео недоступен."}

КРАСНЫЕ ФЛАГИ:
${riskLines}

ТРАНСКРИПТ:
${video.transcript || "Транскрипт отсутствует."}

ОПИСАНИЕ/OCR:
${video.ocr || "Описание/OCR отсутствует."}

ФОРМАТ ОТВЕТА:
Верни JSON с полями: is_educational, total, grade, scales, segment_evidence, strengths, risks, limitations.`;
}

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function excelCell(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  if (typeof value === "boolean") {
    return `<Cell><Data ss:Type="String">${value ? "TRUE" : "FALSE"}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function excelRow(values) {
  return `<Row>${values.map(excelCell).join("")}</Row>`;
}

function excelSheet(name, rows) {
  const safeName = String(name).replace(/[\[\]:*?/\\]/g, " ").slice(0, 31);
  return `<Worksheet ss:Name="${xmlEscape(safeName)}"><Table>${rows.map(excelRow).join("")}</Table></Worksheet>`;
}

function chunkTextRows(label, text, chunkSize = 30000) {
  const value = String(text || "");
  if (!value) return [[label, 1, ""]];
  const rows = [];
  for (let index = 0; index < value.length; index += chunkSize) {
    rows.push([label, rows.length + 1, value.slice(index, index + chunkSize)]);
  }
  return rows;
}

function downloadExcelWorkbook(filename, sheets) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${sheets.map((sheet) => excelSheet(sheet.name, sheet.rows)).join("")}
</Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

function safeFileName(value) {
  return String(value || "green-a-rating")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, "-")
    .slice(0, 80) || "green-a-rating";
}

function exportRatingData() {
  if (!state.hasLoadedVideo) {
    setFetchStatus("Сначала запустите анализ ролика, потом скачайте Excel.", "error");
    return;
  }
  const video = currentVideoPayload();
  const { scores, flags, data } = calculateScores();
  const total = flags.educationalFit.exclude ? null : weightedTotal(scores);
  const grade = flags.educationalFit.exclude ? "N/A" : gradeFor(total);
  const risks = buildRisks(scores, flags, data);
  const timecodeIssues = validateTimecodes();
  const audienceRows = audienceFit(scores, flags, data);
  const prompt = buildRatingPrompt(video, scores, flags, risks);
  const popularLeaders = state.popularBenchmark?.leaders || (state.popularBenchmark?.leader ? [state.popularBenchmark.leader] : []);
  const topicInfo = video.topicClassification || classifyTopic(video);

  const sheets = [
    {
      name: "Промпт",
      rows: [
        ["Поле", "Часть", "Значение"],
        ...chunkTextRows("Готовый промпт для рейтингования", prompt)
      ]
    },
    {
      name: "Видео",
      rows: [
        ["Поле", "Значение"],
        ["URL", video.url],
        ["Название", video.title],
        ["Тематика", video.topic],
        ["Тематика: уверенность", topicInfo.confidence || ""],
        ["Тематика: предметные признаки", (topicInfo.evidence || []).join("; ")],
        ["Тематика: альтернативы", (topicInfo.alternatives || []).map((item) => `${item.label}: ${item.score}`).join("; ")],
        ["Benchmark topic", benchmarkTopic(video)],
        ["Режим анализа", els.analysisMode.value],
        ["Итоговый балл", total ?? NOT_AVAILABLE_LABEL],
        ["Класс", grade],
        ["Обучающий формат, 0-10", flags.educationalFit.score],
        ["Исключено из рейтинга", flags.educationalFit.exclude],
        ["Слабый обучающий формат", flags.educationalFit.weak],
        ["Причины классификации", flags.educationalFit.reasons.join("; ")],
        ["Качество звука", Number(video.audio)],
        ["Качество видео", Number(video.video)],
        ["Читаемость слайдов", Number(video.slides)],
        ["Темп речи", Number(video.pace)],
        ["Среднее качество сегментов", flags.segmentQuality ? Number(flags.segmentQuality.toFixed(2)) : 0],
        ["Визуальных наблюдений", flags.visualObservationCount || 0],
        ["Визуальный fallback включен", Boolean(flags.visualFallbackActive)],
        ["Среднее качество визуальных наблюдений", flags.visualQuality ? Number(flags.visualQuality.toFixed(2)) : 0]
      ]
    },
    {
      name: "Шкалы",
      rows: [
        ["ID", "Шкала", "Вес, %", "Оценка 0-10", "Вклад в 100-балльный рейтинг"],
        ...scales.map((scale) => [
          scale.id,
          scale.label,
          scale.weight,
          Number(scores[scale.id].toFixed(2)),
          Number(((scores[scale.id] * scale.weight) / 10).toFixed(2))
        ])
      ]
    },
    {
      name: "Сегменты",
      rows: [
        ["#", "Таймкод", "Тип", "Тема", "Источник", "Оценка сегмента", "Признаки", "Наблюдение"],
        ...video.segments.map((segment, index) => [
          index + 1,
          segment.time,
          segment.type,
          segment.topic || "",
          segment.source || "",
          Number(segment.score || 0),
          segment.evidence || "",
          segment.note || ""
        ])
      ]
    },
    {
      name: "Визуал",
      rows: [
        ["#", "Таймкод", "Тип", "Источник", "Оценка", "Признаки на экране", "Описание наблюдения", "Thumbnail"],
        ...(video.visualObservations?.length ? video.visualObservations.map((item, index) => [
          index + 1,
          item.time || "",
          item.type || "",
          item.source || "visual",
          Number(item.score || 0),
          item.evidence || "",
          item.note || "",
          item.thumbnail || ""
        ]) : [["", "", "", "", "", "", "Визуальные наблюдения отсутствуют.", ""]])
      ]
    },
    {
      name: "Медиа",
      rows: [
        ["Тип", "Поле", "Значение"],
        ["audio", "available", Boolean(video.mediaAnalysis?.audio?.available)],
        ["audio", "score", video.mediaAnalysis?.audio?.score ?? ""],
        ["audio", "meanVolumeDb", video.mediaAnalysis?.audio?.meanVolumeDb ?? ""],
        ["audio", "maxVolumeDb", video.mediaAnalysis?.audio?.maxVolumeDb ?? ""],
        ["audio", "silenceRatio", video.mediaAnalysis?.audio?.silenceRatio ?? ""],
        ["audio", "silenceEvents", video.mediaAnalysis?.audio?.silenceEvents ?? ""],
        ["audio", "warnings", (video.mediaAnalysis?.audio?.warnings || []).join("; ")],
        ["video", "available", Boolean(video.mediaAnalysis?.video?.available)],
        ["video", "score", video.mediaAnalysis?.video?.score ?? ""],
        ["video", "readabilityScore", video.mediaAnalysis?.video?.readabilityScore ?? ""],
        ["video", "averageBrightness", video.mediaAnalysis?.video?.averageBrightness ?? ""],
        ["video", "averageContrast", video.mediaAnalysis?.video?.averageContrast ?? ""],
        ["video", "frameCount", video.mediaAnalysis?.video?.frameCount ?? ""],
        ["video", "warnings", (video.mediaAnalysis?.video?.warnings || []).join("; ")],
        ["ocr", "available", Boolean(video.mediaAnalysis?.ocr?.available)],
        ["ocr", "frames", video.mediaAnalysis?.ocr?.frames?.length || 0],
        ["ocr", "text", video.mediaAnalysis?.ocr?.text || ""],
        ["ocr", "warnings", (video.mediaAnalysis?.ocr?.warnings || []).join("; ")]
      ]
    },
    {
      name: "Риски",
      rows: [
        ["Уровень", "Риск", "Обоснование"],
        ...risks.map(([level, title, body]) => [level, title, body])
      ]
    },
    {
      name: "Аудитория",
      rows: [
        ["Аудитория", "Оценка 0-10", "Обоснование"],
        ...audienceRows.map((row) => [row.label, Number(row.score.toFixed(2)), row.reason])
      ]
    },
    {
      name: "Таймкоды аудит",
      rows: [
        ["Уровень", "Сегмент", "Проблема", "Описание"],
        ...(timecodeIssues.length ? timecodeIssues.map((issue) => [issue.level, issue.index + 1, issue.title, issue.body]) : [["ok", "", "Таймкоды согласованы", "Формат, порядок и длительность выглядят корректно."]])
      ]
    },
    {
      name: "Исходные тексты",
      rows: [
        ["Поле", "Часть", "Текст"],
        ...chunkTextRows("Транскрипт", video.transcript),
        ...chunkTextRows("Описание и OCR", video.ocr),
        ...chunkTextRows("Визуальные наблюдения", visualObservationLines(video.visualObservations || []).join("\n")),
        ...chunkTextRows("Медиа-анализ", mediaAnalysisLines(video.mediaAnalysis).join("\n"))
      ]
    },
    {
      name: "Бенчмарки",
      rows: [
        ["#", "Источник", "Название", "URL", "Просмотры", "Балл/класс"],
        ...popularLeaders.map((leader, index) => [
          index + 1,
          state.popularBenchmark?.searchScope || "YouTube benchmark",
          leader.title || leader.searchTitle || "",
          leader.url || "",
          leader.views || "",
          leader.total ? `${leader.grade || ""} ${leader.total}`.trim() : ""
        ])
      ]
    }
  ];

  downloadExcelWorkbook(`${safeFileName(video.title)}-green-a-rating.xls`, sheets);
  setFetchStatus("Excel-файл с пакетом для рейтингования скачан.", "ok");
}

function currentAnalysis() {
  const { scores, flags } = calculateScores();
  const total = flags.educationalFit.exclude ? null : weightedTotal(scores);
  const draft = currentVideoPayload();
  const topicInfo = draft.topicClassification || classifyTopic(draft);
  return {
    ...draft,
    scores,
    total,
    grade: flags.educationalFit.exclude ? "N/A" : gradeFor(total),
    educationalFit: flags.educationalFit,
    topic: topicInfo.label !== "Без темы" ? topicInfo.label : draft.topic,
    topicClassification: topicInfo,
    benchmarkTopic: topicInfo.benchmark
  };
}

function scoreDeltaRows(referenceScores, currentScores) {
  return scales
    .map((scale) => ({
      label: scale.label,
      delta: referenceScores[scale.id] - currentScores[scale.id]
    }))
    .filter((row) => row.delta > 0.35)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);
}

function renderBenchmarks(current) {
  if (current.educationalFit?.exclude) {
    els.benchmarkList.innerHTML = `<div class="empty-state">Бенчмарки не подбираются: текущий ролик не классифицирован как обучающий.</div>`;
    return;
  }
  const currentTopic = topicKey(current);
  const currentUrl = current.url.trim();
  const candidates = state.videos
    .map(analyzeVideo)
    .filter((video) => !video.educationalFit?.exclude)
    .filter((video) => {
      const sameTopic = topicKey(video) === currentTopic;
      const sameVideo = currentUrl && video.url.trim() === currentUrl;
      return sameTopic && !sameVideo && video.total > current.total;
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  if (!candidates.length) {
    els.benchmarkList.innerHTML = `
      <div class="empty-state">
        Нет сохраненных роликов по теме «${escapeHtml(current.topic)}» с рейтингом выше ${current.total}.
        Загрузите демо-набор или сохраните несколько роликов одной тематики.
      </div>
    `;
    return;
  }

  els.benchmarkList.innerHTML = "";
  candidates.forEach((video) => {
    const gaps = scoreDeltaRows(video.scores, current.scores);
    const item = document.createElement("button");
    item.type = "button";
    item.className = "benchmark-item";
    item.dataset.videoId = video.id;
    item.innerHTML = `
      <span class="benchmark-head">
        <strong>${escapeHtml(video.title)}</strong>
        <b>${video.grade} ${video.total}</b>
      </span>
        <span class="topic-chip">${escapeHtml(topicLabel(video))}</span>
      <span class="benchmark-delta">+${video.total - current.total} к текущему ролику</span>
      <span class="benchmark-gaps">
        ${gaps.length ? gaps.map((gap) => `<i>${escapeHtml(gap.label)} +${gap.delta.toFixed(1)}</i>`).join("") : "<i>Преимущество распределено равномерно</i>"}
      </span>
    `;
    els.benchmarkList.appendChild(item);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderDashboard() {
  const analyzed = state.videos.map(analyzeVideo);
  const ranked = analyzed.filter((video) => !video.educationalFit?.exclude).sort((a, b) => b.total - a.total);
  const riskTotal = ranked.reduce((sum, video) => sum + video.riskTotal, 0);
  const average = ranked.length ? Math.round(ranked.reduce((sum, video) => sum + video.total, 0) / ranked.length) : 0;
  const topics = groupByTopic(ranked);
  els.videoCount.textContent = ranked.length;
  els.averageScore.textContent = average;
  els.leaderGrade.textContent = ranked[0] ? `${ranked[0].grade} ${ranked[0].total}` : "-";
  els.riskCount.textContent = riskTotal;
  els.topicCount.textContent = topics.length;
  renderRanking(ranked);
  renderTopics(topics);
  renderComparison(ranked);
  if (state.hasLoadedVideo) renderBenchmarks(currentAnalysis());
}

function groupByTopic(ranked) {
  const groups = new Map();
  ranked.forEach((video) => {
    const topic = topicLabel(video);
    if (!groups.has(topic)) groups.set(topic, []);
    groups.get(topic).push(video);
  });
  return [...groups.entries()]
    .map(([topic, videos]) => {
      const sorted = videos.slice().sort((a, b) => b.total - a.total);
      const average = Math.round(sorted.reduce((sum, video) => sum + video.total, 0) / sorted.length);
      const risks = sorted.reduce((sum, video) => sum + video.riskTotal, 0);
      return { topic, videos: sorted, leader: sorted[0], average, risks };
    })
    .sort((a, b) => b.average - a.average);
}

function renderRanking(ranked) {
  if (!ranked.length) {
    els.rankingTable.innerHTML = `<div class="empty-state">Сохраните текущий ролик или загрузите демо-набор, чтобы увидеть таблицу лидеров.</div>`;
    return;
  }
  els.rankingTable.innerHTML = "";
  ranked.forEach((video, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `ranking-row${video.id === state.selectedVideoId ? " active" : ""}`;
    row.dataset.videoId = video.id;
    const top = topScales(video.scores).slice(0, 3);
    row.innerHTML = `
      <span class="rank-number">${index + 1}</span>
      <span class="video-meta">
        <strong>${escapeHtml(video.title)}</strong>
        <span>${escapeHtml(video.url || "URL не указан")}</span>
        <em class="topic-chip">${escapeHtml(topicLabel(video))}</em>
      </span>
      <span class="ranking-stat"><span>Балл</span><strong>${video.total}</strong></span>
      <span class="ranking-stat"><span>Класс</span><strong>${video.grade}</strong></span>
      <span class="mini-bars" aria-label="${escapeHtml(top.join(", "))}">
        ${top.map((label) => {
          const scale = scales.find((item) => item.label.toLowerCase() === label);
          return `<i title="${escapeHtml(label)}" style="width:${Math.max(12, video.scores[scale.id] * 10)}%"></i>`;
        }).join("")}
      </span>
    `;
    els.rankingTable.appendChild(row);
  });
}

function renderPopularBenchmark(current) {
  if (!state.hasLoadedVideo || !current.url.trim()) {
    els.popularBenchmark.innerHTML = `<div class="empty-state">Загрузите YouTube URL, чтобы подобрать предметный benchmark.</div>`;
    return;
  }
  if (current.educationalFit?.exclude) {
    els.popularBenchmark.innerHTML = `<div class="empty-state">Benchmark не подбирается: текущий ролик не является обучающим по критериям Green Argus.</div>`;
    return;
  }
  if (state.popularStatus === "loading") {
    els.popularBenchmark.innerHTML = `<div class="empty-state">Ищу самый просматриваемый обучающий ролик по теме «${escapeHtml(state.popularTopic || current.benchmarkTopic || current.topic)}» и считаю его рейтинг...</div>`;
    return;
  }
  if (state.popularStatus === "error") {
    els.popularBenchmark.innerHTML = `<div class="empty-state">Не удалось найти популярный YouTube-образец по предметной теме «${escapeHtml(current.benchmarkTopic || current.topic)}». Попробуйте уточнить поле «Тематика» или название ролика.</div>`;
    return;
  }
  if (!state.popularBenchmark) {
    els.popularBenchmark.innerHTML = `<div class="empty-state">После анализа ролика здесь появится сравнение с самым просматриваемым найденным роликом той же темы.</div>`;
    return;
  }
  const leaders = state.popularBenchmark.leaders || (state.popularBenchmark.leader ? [state.popularBenchmark.leader] : []);
  els.popularBenchmark.innerHTML = leaders.map((leader, index) => {
    const popular = analyzeVideo(leader);
    const delta = popular.total - current.total;
    const gaps = scoreDeltaRows(popular.scores, current.scores);
    return `
      <article class="popular-card">
        <span class="benchmark-head">
          <strong>${index + 1}. ${escapeHtml(popular.title)}</strong>
          <b>${popular.grade} ${popular.total}</b>
        </span>
        <span class="topic-chip">${escapeHtml(state.popularBenchmark.topic)}</span>
        <span class="popular-views">Предметный запрос: ${escapeHtml(state.popularBenchmark.query || state.popularBenchmark.topic)}</span>
        <span class="rating-compare">
          <span><small>Текущий ролик</small><strong>${current.grade} ${current.total}</strong></span>
          <span><small>Benchmark</small><strong>${popular.grade} ${popular.total}</strong></span>
          <span><small>Разница</small><strong>${delta >= 0 ? "+" : ""}${delta}</strong></span>
        </span>
        <span class="popular-views">${escapeHtml(popular.viewText || "")} просмотров</span>
        <span class="benchmark-delta">${delta >= 0 ? "+" : ""}${delta} к текущему ролику</span>
        <span class="benchmark-gaps">
          ${gaps.length ? gaps.map((gap) => `<i>${escapeHtml(gap.label)} +${gap.delta.toFixed(1)}</i>`).join("") : "<i>Профиль близок к текущему ролику</i>"}
        </span>
        <a href="${escapeHtml(popular.url)}" target="_blank" rel="noreferrer">Открыть на YouTube</a>
      </article>
    `;
  }).join("");
}

async function fetchPopularBenchmark() {
  const current = currentAnalysis();
  if (!state.hasLoadedVideo || !current.url.trim()) {
    state.popularStatus = "idle";
    state.popularBenchmark = null;
    renderPopularBenchmark(current);
    return;
  }
  if (current.educationalFit?.exclude) {
    state.popularStatus = "idle";
    state.popularBenchmark = null;
    renderPopularBenchmark(current);
    return;
  }
  const subject = current.benchmarkTopic || current.topic;
  if (!subject || subject === "Без темы") {
    state.popularStatus = "idle";
    state.popularBenchmark = null;
    renderPopularBenchmark(current);
    return;
  }
  state.popularStatus = "loading";
  state.popularTopic = subject;
  state.popularBenchmark = null;
  renderPopularBenchmark(current);
  try {
    const response = await fetch(`${apiBase()}/api/popular?topic=${encodeURIComponent(subject)}&currentUrl=${encodeURIComponent(current.url)}`);
    const payload = await readJsonResponse(response);
    if (!response.ok) throw new Error(payload.error || "Не удалось найти популярный ролик.");
    state.popularBenchmark = payload;
    state.popularStatus = "ready";
  } catch {
    state.popularBenchmark = null;
    state.popularStatus = "error";
  }
  renderPopularBenchmark(currentAnalysis());
}

function renderTopics(groups) {
  if (!groups.length) {
    els.topicGroups.innerHTML = `<div class="empty-state">Сохраненные ролики будут автоматически сгруппированы по тематикам.</div>`;
    return;
  }
  els.topicGroups.innerHTML = "";
  groups.forEach((group) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "topic-group";
    item.dataset.videoId = group.leader.id;
    item.innerHTML = `
      <span class="topic-group-head">
        <strong>${escapeHtml(group.topic)}</strong>
        <span>${group.videos.length} видео</span>
      </span>
      <span class="topic-stats">
        <span>Средний <b>${group.average}</b></span>
        <span>Лидер <b>${group.leader.grade} ${group.leader.total}</b></span>
        <span>Риски <b>${group.risks}</b></span>
      </span>
      <span class="video-meta">
        <span>Лучший ролик</span>
        <strong>${escapeHtml(group.leader.title)}</strong>
      </span>
      <span class="bar"><i style="width:${group.average}%"></i></span>
    `;
    els.topicGroups.appendChild(item);
  });
}

function renderComparison(ranked) {
  if (!ranked.length) {
    els.comparisonGrid.innerHTML = `<div class="empty-state">Здесь появится средний профиль по восьми шкалам.</div>`;
    return;
  }
  els.comparisonGrid.innerHTML = "";
  scales.forEach((scale) => {
    const value = ranked.reduce((sum, video) => sum + video.scores[scale.id], 0) / ranked.length;
    const row = document.createElement("div");
    row.className = "comparison-row";
    row.innerHTML = `
      <span>${scale.label}</span>
      <strong>${value.toFixed(1)}</strong>
      <div class="bar"><i style="width:${value * 10}%"></i></div>
    `;
    els.comparisonGrid.appendChild(row);
  });
}

function saveCurrentVideo() {
  const payload = currentVideoPayload();
  const existingIndex = state.videos.findIndex((video) => video.id === payload.id);
  if (existingIndex >= 0) state.videos[existingIndex] = payload;
  else state.videos.push(payload);
  state.selectedVideoId = payload.id;
  renderDashboard();
}

function loadVideo(videoId) {
  const video = state.videos.find((item) => item.id === videoId);
  if (!video) return;
  state.selectedVideoId = video.id;
  state.hasLoadedVideo = true;
  els.videoUrl.value = video.url;
  els.videoTitle.value = video.title;
  els.videoTopic.value = video.topic || topicLabel(video);
  state.videoDescription = video.description || "";
  els.transcript.value = video.transcript;
  els.ocrText.value = video.ocr;
  els.audioQuality.value = video.audio;
  els.videoQuality.value = video.video;
  els.slideReadability.value = video.slides;
  els.speechPace.value = video.pace;
  state.segments = video.segments.map((segment) => ({ ...segment }));
  state.visualObservations = Array.isArray(video.visualObservations)
    ? video.visualObservations.map((item) => ({ ...item }))
    : [];
  state.mediaAnalysis = video.mediaAnalysis ? structuredClone(video.mediaAnalysis) : null;
  renderSegments();
  syncRangeLabels();
  update();
}

function topScales(scores) {
  return scales
    .slice()
    .sort((a, b) => scores[b.id] - scores[a.id])
    .slice(0, 3)
    .map((scale) => scale.label.toLowerCase());
}

function drawRadar(scores) {
  const canvas = els.radar;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = 128;
  ctx.clearRect(0, 0, size, size);
  ctx.lineWidth = 0.75;
  ctx.font = "11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let ring = 1; ring <= 5; ring += 1) {
    ctx.beginPath();
    scales.forEach((scale, index) => {
      const angle = (Math.PI * 2 * index / scales.length) - Math.PI / 2;
      const pointRadius = radius * ring / 5;
      const x = center + Math.cos(angle) * pointRadius;
      const y = center + Math.sin(angle) * pointRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    ctx.stroke();
  }

  scales.forEach((scale, index) => {
    const angle = (Math.PI * 2 * index / scales.length) - Math.PI / 2;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();
    const labelX = center + Math.cos(angle) * (radius + 26);
    const labelY = center + Math.sin(angle) * (radius + 26);
    ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
    ctx.fillText(String(index + 1), labelX, labelY);
  });

  ctx.beginPath();
  scales.forEach((scale, index) => {
    const angle = (Math.PI * 2 * index / scales.length) - Math.PI / 2;
    const pointRadius = radius * scores[scale.id] / 10;
    const x = center + Math.cos(angle) * pointRadius;
    const y = center + Math.sin(angle) * pointRadius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(45, 212, 255, 0.20)";
  ctx.strokeStyle = "#2dd4ff";
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();
}

function zeroScores() {
  return Object.fromEntries(scales.map((scale) => [scale.id, 0]));
}

function renderEmptyAnalysis() {
  const scores = zeroScores();
  els.score.textContent = "0";
  els.grade.textContent = "-";
  els.ratingSummary.textContent = "Загрузите YouTube URL, чтобы рассчитать рейтинг.";
  renderScales(scores);
  els.audienceList.innerHTML = `
    <article class="audience-card"><span class="audience-head"><strong>Новички</strong><b>0.0</b></span><span class="bar"><i style="width:0%"></i></span><p>Нет загруженного ролика.</p></article>
    <article class="audience-card"><span class="audience-head"><strong>Средний уровень</strong><b>0.0</b></span><span class="bar"><i style="width:0%"></i></span><p>Нет загруженного ролика.</p></article>
    <article class="audience-card"><span class="audience-head"><strong>Профессиональное сообщество</strong><b>0.0</b></span><span class="bar"><i style="width:0%"></i></span><p>Нет загруженного ролика.</p></article>
  `;
  els.benchmarkList.innerHTML = `<div class="empty-state">Загрузите ролик, чтобы увидеть образцы выше по теме.</div>`;
  els.popularBenchmark.innerHTML = `<div class="empty-state">Загрузите YouTube URL, чтобы подобрать предметный benchmark.</div>`;
  els.riskList.innerHTML = `<div class="empty-state">Риски появятся после анализа ролика.</div>`;
  els.evidenceList.innerHTML = `<div class="empty-state">Таймкоды появятся после анализа ролика.</div>`;
  drawRadar(scores);
  renderDashboard();
  renderTimecodeAudit();
}

function update() {
  if (!state.hasLoadedVideo) {
    renderEmptyAnalysis();
    return;
  }
  const { scores, flags, data } = calculateScores();
  const isExcluded = flags.educationalFit.exclude;
  const total = isExcluded ? null : weightedTotal(scores);
  const grade = isExcluded ? "N/A" : gradeFor(total);
  els.score.textContent = total ?? NOT_AVAILABLE_LABEL;
  els.grade.textContent = grade;
  els.ratingSummary.textContent = !isExcluded
    ? [summaryFor(total), flags.educationalFit.weak ? `Пограничный обучающий формат: уверенность ${flags.educationalFit.confidence || "low"}, оценка ${flags.educationalFit.score}/10.` : "", ratingCapNote(scores)].filter(Boolean).join(" ")
    : `Ролик исключен из образовательного рейтинга и помечен как ${NOT_AVAILABLE_LABEL}: по описанию и содержанию это скорее познавательный/медийный материал без достаточной учебной механики.`;

  els.transcriptView.textContent = data.transcript.trim() || "Транскрипт отсутствует.";
  const visualLines = visualObservationLines(state.visualObservations).join("\n");
  els.visualView.textContent = visualLines || "Визуальные наблюдения отсутствуют.";
  els.ocrView.textContent = data.ocr.trim() || "Текст на слайдах / OCR отсутствует.";

  renderScales(scores);
  renderAudience(scores, flags, data);
  const currentPayload = currentVideoPayload();
  const topicInfo = currentPayload.topicClassification || classifyTopic(currentPayload);
  const currentWithScores = {
    ...currentPayload,
    scores,
    total,
    grade,
    topic: topicInfo.label !== "Без темы" ? topicInfo.label : currentPayload.topic,
    topicClassification: topicInfo,
    benchmarkTopic: topicInfo.benchmark
  };
  renderBenchmarks(currentWithScores);
  renderPopularBenchmark(currentWithScores);
  renderRisks(buildRisks(scores, flags, data));
  renderEvidence(scores, flags);
  drawRadar(scores);
  renderDashboard();
  renderTimecodeAudit();
}

function syncRangeLabels() {
  ["audioQuality", "videoQuality", "slideReadability"].forEach((id) => {
    document.querySelector(`#${id}Value`).textContent = document.querySelector(`#${id}`).value;
  });
}

document.querySelector("#addSegment").addEventListener("click", () => {
  state.segments.push({ time: "00:00-01:00", type: "теория", note: "" });
  renderSegments();
  update();
});

document.querySelector("#loadDemo").addEventListener("click", () => {
  els.videoUrl.value = demo.url;
  els.videoTitle.value = demo.title;
  els.videoTopic.value = demo.topic;
  state.videoDescription = demo.description || "";
  els.transcript.value = demo.transcript;
  els.ocrText.value = demo.ocr;
  state.segments = demo.segments.map((segment) => ({ ...segment }));
  state.visualObservations = [];
  state.mediaAnalysis = null;
  state.selectedVideoId = null;
  state.hasLoadedVideo = true;
  renderSegments();
  update();
});

els.fetchYouTube.addEventListener("click", fetchYouTubeData);

els.saveVideo.addEventListener("click", saveCurrentVideo);

els.exportRatingData.addEventListener("click", exportRatingData);

els.loadDashboardDemo.addEventListener("click", () => {
  state.videos = dashboardDemo.map((video) => ({
    id: crypto.randomUUID(),
    audio: 8,
    video: 8,
    slides: 7,
    pace: 8,
    ...video,
    segments: video.segments.map((segment) => ({ ...segment })),
    visualObservations: Array.isArray(video.visualObservations) ? video.visualObservations.map((item) => ({ ...item })) : [],
    mediaAnalysis: video.mediaAnalysis ? structuredClone(video.mediaAnalysis) : null
  }));
  loadVideo(state.videos[0].id);
  renderDashboard();
});

els.rankingTable.addEventListener("click", (event) => {
  const row = event.target.closest(".ranking-row");
  if (!row) return;
  loadVideo(row.dataset.videoId);
});

els.topicGroups.addEventListener("click", (event) => {
  const group = event.target.closest(".topic-group");
  if (!group) return;
  loadVideo(group.dataset.videoId);
});

els.benchmarkList.addEventListener("click", (event) => {
  const item = event.target.closest(".benchmark-item");
  if (!item) return;
  loadVideo(item.dataset.videoId);
});

els.segments.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  const index = Number(event.target.dataset.index);
  if (!field || Number.isNaN(index)) return;
  state.segments[index][field] = event.target.value;
  update();
});

els.segments.addEventListener("click", (event) => {
  const index = Number(event.target.dataset.remove);
  if (Number.isNaN(index)) return;
  state.segments.splice(index, 1);
  renderSegments();
  update();
});

[els.videoUrl, els.videoTitle, els.videoTopic, els.transcript, els.ocrText, els.audioQuality, els.videoQuality, els.slideReadability, els.speechPace].forEach((element) => {
  element.addEventListener("input", () => {
    if (element === els.videoUrl && !els.videoUrl.value.trim()) {
      state.hasLoadedVideo = false;
      state.popularBenchmark = null;
      state.popularStatus = "idle";
      state.visualObservations = [];
      state.mediaAnalysis = null;
      state.videoDescription = "";
    }
    syncRangeLabels();
    update();
  });
});

renderSegments();
syncRangeLabels();
update();
