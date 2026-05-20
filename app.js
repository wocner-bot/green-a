const scales = [
  { id: "depth", label: "Содержательная глубина", weight: 30 },
  { id: "pedagogy", label: "Педагогическое качество", weight: 18 },
  { id: "structure", label: "Структурированность", weight: 14 },
  { id: "practice", label: "Практическая применимость", weight: 13 },
  { id: "reliability", label: "Достоверность", weight: 12 },
  { id: "complexity", label: "Когнитивная сложность", weight: 7 },
  { id: "technical", label: "Техническое качество", weight: 4 },
  { id: "communication", label: "Коммуникация", weight: 2 }
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
  segments: []
};

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
  loadDashboardDemo: document.querySelector("#loadDashboardDemo"),
  scaleList: document.querySelector("#scaleList"),
  audienceList: document.querySelector("#audienceList"),
  benchmarkList: document.querySelector("#benchmarkList"),
  popularBenchmark: document.querySelector("#popularBenchmark"),
  riskList: document.querySelector("#riskList"),
  evidenceList: document.querySelector("#evidenceList"),
  score: document.querySelector("#score"),
  grade: document.querySelector("#grade"),
  headerScore: document.querySelector("#headerScore"),
  headerGrade: document.querySelector("#headerGrade"),
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

function uniqueTypes(segments = state.segments) {
  return new Set(segments.map((segment) => segment.type.trim().toLowerCase()).filter(Boolean)).size;
}

function getInputs() {
  const transcript = els.transcript.value.trim();
  const ocr = els.ocrText.value.trim();
  const title = els.videoTitle.value.trim();
  const topic = els.videoTopic.value.trim();
  const combined = `${title}\n${topic}\n${transcript}\n${ocr}`;
  return {
    title,
    topic,
    transcript,
    ocr,
    combined,
    audio: Number(els.audioQuality.value),
    video: Number(els.videoQuality.value),
    slides: Number(els.slideReadability.value),
    pace: Number(els.speechPace.value)
  };
}

function inferTopic(video) {
  const text = `${video.title || ""} ${video.topicSeed || ""} ${video.transcript || ""} ${video.ocr || ""}`.toLowerCase();
  if (/физик|physics|механик|электродинамик|квант|термодинамик|егэ.*физ/.test(text)) return "Физика";
  if (/математ|math|алгебр|геометр|calculus|егэ.*мат/.test(text)) return "Математика";
  if (/английск|english|ielts|toefl|grammar|vocabulary|немецк|deutsch|испанск|французск|японск|китайск/.test(text)) return "Иностранные языки";
  if (/трейдинг|trading|бирж|крипт|инвест|акци[ия]|forex|форекс/.test(text)) return "Трейдинг и инвестиции";
  if (/python|javascript|typescript|react|node|программ|кодинг|разработк/.test(text)) return "Программирование";
  if (/sql|postgres|join|таблиц|баз[аы] данных/.test(text)) return "Базы данных";
  if (/ux|ui|дизайн|интерфейс|исследован|продукт/.test(text)) return "UX и продуктовый дизайн";
  if (/ai|ии|нейро|machine learning|машинн|модель|нейросет/.test(text)) return "AI и машинное обучение";
  if (/продаж|маркет|скидк|оффер|подпис/.test(text)) return "Маркетинг и продажи";
  if (/обуч|педагог|методолог|урок|курс|когнитив/.test(text)) return "Методология обучения";
  return "Без темы";
}

function benchmarkTopicFromText(text) {
  const value = String(text || "").toLowerCase();
  if (/физик|physics|механик|электродинамик|квант|термодинамик|егэ.*физ/.test(value)) return "обучение физике";
  if (/математ|math|алгебр|геометр|calculus|егэ.*мат/.test(value)) return "обучение математике";
  if (/английск|english|ielts|toefl|grammar|vocabulary/.test(value)) return "обучение английскому языку";
  if (/немецк|deutsch/.test(value)) return "обучение немецкому языку";
  if (/испанск/.test(value)) return "обучение испанскому языку";
  if (/французск/.test(value)) return "обучение французскому языку";
  if (/японск/.test(value)) return "обучение японскому языку";
  if (/китайск/.test(value)) return "обучение китайскому языку";
  if (/иностранн.*язык|языков/.test(value) && !/программ|код|python|javascript|typescript|react|node/.test(value)) return "обучение иностранному языку";
  if (/трейдинг|trading|бирж|крипт|инвест|акци[ия]|forex|форекс/.test(value)) return "обучение трейдингу";
  if (/python/.test(value)) return "обучение Python";
  if (/javascript|typescript|react|node|программ|кодинг|разработк/.test(value)) return "обучение программированию";
  if (/sql|postgres|join|таблиц|баз[аы] данных/.test(value)) return "обучение SQL";
  if (/ux|ui|дизайн|интерфейс|исследован|продукт/.test(value)) return "обучение UX дизайну";
  if (/ai|ии|нейро|machine learning|машинн|модель|нейросет/.test(value)) return "обучение нейросетям";
  return "";
}

function benchmarkTopic(video) {
  const topicMatch = benchmarkTopicFromText(video.topic || "");
  if (topicMatch) return topicMatch;
  const titleMatch = benchmarkTopicFromText(`${video.title || ""} ${video.topicSeed || ""}`);
  if (titleMatch) return titleMatch;
  const contentMatch = benchmarkTopicFromText(`${video.transcript || ""} ${video.ocr || ""}`);
  if (contentMatch) return contentMatch;
  const title = (video.title || "").replace(/[|:–—-].*$/, "").replace(/\b(как|урок|курс|обучение|для начинающих|с нуля)\b/gi, "").trim();
  return title ? `${title} обучение` : inferTopic(video);
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

function applyYouTubeData(video) {
  els.videoUrl.value = video.url || els.videoUrl.value.trim();
  els.videoTitle.value = video.title || "";
  els.videoTopic.value = video.topic || inferTopic(video);
  els.transcript.value = video.transcript || "";
  els.ocrText.value = [
    video.description ? `Описание YouTube:\n${video.description}` : "",
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
    setFetchStatus(`Готово: ${transcriptMessage}, ${modeMessage}.`, "ok");
  } catch (error) {
    setFetchStatus(`Не получилось получить данные: ${error.message}. Запустите локальный сервер или проверьте ссылку.`, "error");
  } finally {
    els.fetchYouTube.disabled = false;
  }
}

function currentVideoPayload() {
  const draft = {
    title: els.videoTitle.value.trim(),
    transcript: els.transcript.value.trim(),
    ocr: els.ocrText.value.trim()
  };
  return {
    id: state.selectedVideoId || crypto.randomUUID(),
    url: els.videoUrl.value.trim(),
    title: els.videoTitle.value.trim() || "Без названия",
    topic: els.videoTopic.value.trim() || inferTopic(draft),
    transcript: els.transcript.value.trim(),
    ocr: els.ocrText.value.trim(),
    audio: Number(els.audioQuality.value),
    video: Number(els.videoQuality.value),
    slides: Number(els.slideReadability.value),
    pace: Number(els.speechPace.value),
    segments: state.segments.map((segment) => ({ ...segment }))
  };
}

function calculateScores(video = null) {
  const data = video
    ? {
        title: (video.title || "").trim(),
        topic: (video.topic || "").trim(),
        transcript: (video.transcript || "").trim(),
        ocr: (video.ocr || "").trim(),
        combined: `${video.title || ""}\n${video.topic || ""}\n${video.transcript || ""}\n${video.ocr || ""}`,
        audio: Number(video.audio),
        video: Number(video.video),
        slides: Number(video.slides),
        pace: Number(video.pace)
      }
    : getInputs();
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
  const educationalFit = assessEducationalFit(data, segments, {
    exampleHits,
    practiceHits,
    structureHits,
    sourceHits,
    termHits,
    textLength,
    practicalChapterHits
  });

  const scores = {
    depth: clamp(3 + Math.min(textLength / 900, 2.1) + termHits * 0.55 + sourceHits * 0.35 + segmentDepthBonus - salesHits * 0.35),
    pedagogy: clamp(2.5 + exampleHits * 0.75 + practiceHits * 0.85 + types * 0.35 + segmentBonus + Math.min(descriptionChapterHits, 6) * 0.18 + Math.max(0, segmentDepthBonus)),
    structure: clamp(2.8 + structureHits * 0.75 + types * 0.6 + segmentBonus + Math.min(descriptionChapterHits, 8) * 0.28 + Math.min(mediaSegmentHits, 8) * 0.12 + (segmentQuality ? 0.35 : 0)),
    practice: clamp(2.2 + practiceHits * 1.1 + exampleHits * 0.45 + practicalChapterHits * 0.45 + segments.filter((segment) => /практика|задание|проверка/i.test(`${segment.type} ${segment.evidence || ""}`)).length * 0.35),
    reliability: clamp(2.8 + sourceHits * 1.25 - promiseHits * 1.2 - salesHits * 0.6),
    complexity: clamp(3 + termHits * 0.45 + types * 0.5 + (textLength > 1200 ? 1.1 : 0.4)),
    technical: clamp((data.audio * 0.42) + (data.video * 0.34) + (data.slides * 0.24)),
    communication: clamp((data.pace * 0.55) + (data.audio * 0.25) + structureHits * 0.25 + 1.2)
  };
  scores.educationalFitScore = educationalFit.score;

  return { scores, data, flags: { salesHits, promiseHits, sourceHits, practiceHits, textLength, educationalFit, segmentQuality } };
}

function analyzeVideo(video) {
  const { scores, flags, data } = calculateScores(video);
  const total = weightedTotal(scores);
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

function assessEducationalFit(data, segments, signals) {
  const text = data.combined.toLowerCase();
  const title = data.title.toLowerCase();
  const segmentText = segments.map((segment) => `${segment.type} ${segment.note}`).join(" ").toLowerCase();
  const formatHits = countHits(text, [
    "обучение", "обучающий", "урок", "курс", "лекция", "семинар", "tutorial", "lesson", "course"
  ]);
  const methodHits = countHits(text, [
    "разберем", "разбираем", "решим", "решаем", "покажу как", "пошаг", "шаг за шагом",
    "пример", "кейс", "формула", "алгоритм", "метод", "правило", "схема", "how to", "step by step"
  ]);
  const practiceOrCheckHits = countHits(text, [
    "задание", "упражнение", "практика", "практическое", "домашнее задание", "проверь", "проверка",
    "тест", "самостоятельно", "решите", "попробуйте", "practice", "exercise", "quiz"
  ]);
  const goalHits = countHits(text, ["цель урока", "вы научитесь", "научимся", "после урока", "сможете", "навык", "учебн", "learning objective"]);
  const nonLearningHits = countHits(text, [
    "интервью", "подкаст", "новости", "новость", "реакция", "vlog", "развлекатель",
    "документальный", "документалка", "интересные факты", "топ фактов", "обзор событий",
    "обзор", "история", "биография", "размышления", "мнение", "почему это важно", "что происходит",
    "приятного просмотра", "семейный канал", "детский канал", "мультфильм", "сборник серий", "лайки", "подписывайтесь"
  ]);
  const hasLearningSegments = /практи|задани|упраж|пример|разбор|провер/i.test(segmentText);
  const hasChapterStructure = segments.filter((segment) => segment.source === "description").length >= 3;
  const hasCaptionStructure = segments.filter((segment) => segment.source === "captions").length >= 3;
  const hasCourseLikeStructure = hasChapterStructure || hasCaptionStructure;
  const hasLectureFormat = /лекци|lecture|chapter|глава|серия|часть|модуль|course|курс/i.test(text);
  const hasPractice = practiceOrCheckHits > 0 || signals.practiceHits > 0 || signals.practicalChapterHits > 0;
  const hasInstructionalFormat = formatHits > 0 || /урок|курс|обуч|tutorial|lesson|course/i.test(title);
  const hasMethod = methodHits > 0 || signals.exampleHits > 0 || hasLearningSegments;
  const hasGoal = goalHits > 0;
  const hasTeachingCore = hasMethod || hasGoal || signals.practicalChapterHits > 0 || hasCourseLikeStructure || hasLectureFormat || /подробно объясн|объясн|темы.*рассмотр|план урока|содержание урока|what is|why|how|introducing|recap/i.test(text);
  const strongInfotainment = nonLearningHits > 0 && !hasTeachingCore;
  const onlyHomeworkOrViewing = hasPractice && !hasTeachingCore && /домашнее задание|делаем.*задани|приятного просмотра|семейный канал|детский канал/i.test(text);
  const learningEvidence = [
    hasInstructionalFormat,
    hasMethod,
    hasPractice,
    hasGoal,
    hasCourseLikeStructure || hasLectureFormat
  ].filter(Boolean).length;
  const score = Math.max(0, Math.min(10,
    1.5 +
    (hasInstructionalFormat ? 2 : 0) +
    (hasMethod ? 2 : 0) +
    (hasPractice ? 1.5 : 0) +
    (hasGoal ? 1.2 : 0) +
    (hasCourseLikeStructure ? 1.4 : 0) +
    (hasLectureFormat ? 1 : 0) -
    (strongInfotainment ? 3 : 0) -
    (onlyHomeworkOrViewing ? 2.5 : 0) -
    Math.min(nonLearningHits, 3) * 0.45
  ));
  const exclude = score < 3.2 || strongInfotainment || onlyHomeworkOrViewing;
  const eligible = !exclude && score >= 5;
  const weak = !exclude && score < 5;
  const reasons = [];
  if (formatHits) reasons.push(`формат обучения: ${formatHits}`);
  if (methodHits || signals.exampleHits) reasons.push("есть разбор, метод или примеры");
  if (hasPractice) reasons.push("есть практика, задания или проверка");
  if (goalHits) reasons.push("есть учебная цель/результат");
  if (hasCourseLikeStructure) reasons.push("есть структура по главам или субтитрам");
  if (hasLectureFormat) reasons.push("лекционный/курсовой формат");
  if (nonLearningHits) reasons.push(`познавательные/медийные маркеры: ${nonLearningHits}`);
  if (!hasTeachingCore) reasons.push("нет ядра преподавания: разбор метода, объяснение, учебная цель или план урока");
  if (weak) reasons.push("учебный формат слабый: рейтинг будет снижен, но видео не исключено");
  if (exclude) reasons.push("слишком мало признаков обучения или формат явно медийный");
  return { eligible, weak, exclude, score: Number(score.toFixed(1)), learningEvidence, instructionHits: formatHits + methodHits + practiceOrCheckHits, goalHits, nonLearningHits, reasons };
}

function weightedTotal(scores) {
  const raw = rawWeightedTotal(scores);
  const cap = depthRatingCap(scores);
  const educationalCap = educationalFitCap(scores);
  return [cap?.max, educationalCap?.max]
    .filter((value) => Number.isFinite(value))
    .reduce((value, max) => Math.min(value, max), raw);
}

function rawWeightedTotal(scores) {
  return Math.round(scales.reduce((sum, scale) => sum + scores[scale.id] * scale.weight, 0) / 10);
}

function depthRatingCap(scores) {
  const depth = Number(scores.depth || 0);
  if (depth < 2) return { max: 25, grade: "E", reason: "содержательная глубина ниже 2/10" };
  if (depth < 3) return { max: 35, grade: "E", reason: "содержательная глубина ниже 3/10" };
  if (depth < 4) return { max: 50, grade: "D", reason: "содержательная глубина ниже 4/10" };
  if (depth < 5) return { max: 60, grade: "C", reason: "содержательная глубина ниже 5/10" };
  if (depth < 6) return { max: 70, grade: "B", reason: "содержательная глубина ниже 6/10" };
  if (depth < 7) return { max: 82, grade: "B", reason: "содержательная глубина ниже 7/10" };
  return null;
}

function ratingCapNote(scores) {
  const raw = rawWeightedTotal(scores);
  const notes = [depthRatingCap(scores), educationalFitCap(scores)]
    .filter((cap) => cap && raw > cap.max)
    .map((cap) => `до ${cap.max}: ${cap.reason}`);
  if (!notes.length) return "";
  return `Итог ограничен ${notes.join("; ")}. Без ограничений взвешенная сумма была бы ${raw}.`;
}

function educationalFitCap(scores) {
  const fit = scores.educationalFitScore;
  if (!Number.isFinite(fit)) return null;
  if (fit < 5) return { max: 62, reason: "слабые признаки учебного формата" };
  if (fit < 6) return { max: 72, reason: "обучающий формат выражен умеренно" };
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
    const score = Number(segment.score);
    const meta = Number.isFinite(score)
      ? `<span class="segment-meta">Оценка сегмента <b>${score.toFixed(1)}</b> · ${escapeHtml(segment.evidence || segment.source || "авто")}</span>`
      : `<span class="segment-meta">${escapeHtml(segment.source || "ручной сегмент")}</span>`;
    card.innerHTML = `
      <label>
        <span>Таймкод</span>
        <input value="${segment.time}" data-field="time" data-index="${index}" placeholder="00:00-01:00">
      </label>
      <label>
        <span>Тип</span>
        <input value="${segment.type}" data-field="type" data-index="${index}" placeholder="теория">
      </label>
      <label>
        <span>Наблюдение</span>
        <input value="${segment.note}" data-field="note" data-index="${index}" placeholder="пример, источник, упражнение">
      </label>
      ${meta}
      <button type="button" aria-label="Удалить сегмент" data-remove="${index}">×</button>
    `;
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
  if (flags.educationalFit.weak) risks.push(["medium", "Слабый обучающий формат", `Видео похоже на обучающее, но учебная механика выражена слабо. Оценка обучающего формата: ${flags.educationalFit.score}/10.`]);
  if (scores.depth < 5) risks.push(["high", "Слабая содержательная глубина", "Итоговый рейтинг жестко ограничен: без достаточной глубины ролик не может получить высокий образовательный класс."]);
  else if (scores.depth < 7) risks.push(["medium", "Недостаточная глубина для A-класса", "Ролик может быть полезным, но содержательность не дотягивает до уровня сильного учебного образца."]);
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
    item.innerHTML = `<strong>${title}</strong><p>${body}</p>`;
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
    rows.push(["Классификация", `Видео допущено к рейтингу со штрафом за слабый обучающий формат. Оценка формата: ${flags.educationalFit.score}/10. Причины: ${flags.educationalFit.reasons.join("; ")}.`]);
  }
  const capNote = ratingCapNote(scores);
  if (capNote) rows.push(["Потолок рейтинга", capNote]);
  rows.push(["Сводка шкал", `Максимальные зоны: ${topScales(scores).join(", ")}.`]);
  els.evidenceList.innerHTML = "";
  rows.forEach(([title, body]) => {
    const item = document.createElement("article");
    item.className = "evidence";
    item.innerHTML = `<strong>${title}</strong><p>${body}</p>`;
    els.evidenceList.appendChild(item);
  });
}

function currentAnalysis() {
  const { scores, flags } = calculateScores();
  const total = flags.educationalFit.exclude ? 0 : weightedTotal(scores);
  const draft = currentVideoPayload();
  return {
    ...draft,
    scores,
    total,
    grade: flags.educationalFit.exclude ? "N/A" : gradeFor(total),
    educationalFit: flags.educationalFit,
    topic: draft.topic || inferTopic(draft),
    benchmarkTopic: benchmarkTopic(draft)
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
  const currentTopic = (current.topic || "Без темы").toLowerCase();
  const currentUrl = current.url.trim();
  const candidates = state.videos
    .map(analyzeVideo)
    .filter((video) => !video.educationalFit?.exclude)
    .filter((video) => {
      const sameTopic = (video.topic || inferTopic(video)).toLowerCase() === currentTopic;
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
      <span class="topic-chip">${escapeHtml(video.topic || inferTopic(video))}</span>
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
    .replaceAll('"', "&quot;");
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
    const topic = video.topic || inferTopic(video);
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
        <em class="topic-chip">${escapeHtml(video.topic || inferTopic(video))}</em>
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
  els.videoTopic.value = video.topic || inferTopic(video);
  els.transcript.value = video.transcript;
  els.ocrText.value = video.ocr;
  els.audioQuality.value = video.audio;
  els.videoQuality.value = video.video;
  els.slideReadability.value = video.slides;
  els.speechPace.value = video.pace;
  state.segments = video.segments.map((segment) => ({ ...segment }));
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
  els.headerScore.textContent = "0";
  els.grade.textContent = "-";
  els.headerGrade.textContent = "-";
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
  const total = isExcluded ? 0 : weightedTotal(scores);
  const grade = isExcluded ? "N/A" : gradeFor(total);
  els.score.textContent = total;
  els.headerScore.textContent = total;
  els.grade.textContent = grade;
  els.headerGrade.textContent = grade;
  els.ratingSummary.textContent = !isExcluded
    ? [summaryFor(total), flags.educationalFit.weak ? `Обучающий формат выражен слабо: ${flags.educationalFit.score}/10.` : "", ratingCapNote(scores)].filter(Boolean).join(" ")
    : "Ролик исключен из образовательного рейтинга: по описанию и содержанию это скорее познавательный/медийный материал без достаточной учебной механики.";
  renderScales(scores);
  renderAudience(scores, flags, data);
  renderBenchmarks({ ...currentVideoPayload(), scores, total, grade, topic: els.videoTopic.value.trim() || inferTopic(currentVideoPayload()) });
  renderPopularBenchmark({ ...currentVideoPayload(), scores, total, grade, topic: els.videoTopic.value.trim() || inferTopic(currentVideoPayload()) });
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
  els.transcript.value = demo.transcript;
  els.ocrText.value = demo.ocr;
  state.segments = demo.segments.map((segment) => ({ ...segment }));
  state.selectedVideoId = null;
  state.hasLoadedVideo = true;
  renderSegments();
  update();
});

els.fetchYouTube.addEventListener("click", fetchYouTubeData);

els.saveVideo.addEventListener("click", saveCurrentVideo);

els.loadDashboardDemo.addEventListener("click", () => {
  state.videos = dashboardDemo.map((video) => ({
    id: crypto.randomUUID(),
    audio: 8,
    video: 8,
    slides: 7,
    pace: 8,
    ...video,
    segments: video.segments.map((segment) => ({ ...segment }))
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
    }
    syncRangeLabels();
    update();
  });
});

renderSegments();
syncRangeLabels();
update();
