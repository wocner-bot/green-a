const http = require("node:http");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { URL } = require("node:url");

const root = __dirname;
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const youtubeApiKey = String(process.env.YOUTUBE_API_KEY || "").trim();
const videoAnalysisProvider = String(process.env.VIDEO_ANALYSIS_PROVIDER || "local").trim().toLowerCase();
const visionAnalysisProvider = String(process.env.VISION_ANALYSIS_PROVIDER || "local").trim().toLowerCase();
const aiAnalysisProvider = String(process.env.AI_ANALYSIS_PROVIDER || "local").trim().toLowerCase();

function envInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

const azureVideoIndexerConfig = {
  baseUrl: String(process.env.AZURE_VIDEO_INDEXER_BASE_URL || "https://api.videoindexer.ai").replace(/\/+$/, ""),
  accountId: String(process.env.AZURE_VIDEO_INDEXER_ACCOUNT_ID || "").trim(),
  location: String(process.env.AZURE_VIDEO_INDEXER_LOCATION || "").trim(),
  accessToken: String(process.env.AZURE_VIDEO_INDEXER_ACCESS_TOKEN || "").trim(),
  subscriptionKey: String(process.env.AZURE_VIDEO_INDEXER_SUBSCRIPTION_KEY || "").trim(),
  language: String(process.env.AZURE_VIDEO_INDEXER_LANGUAGE || "AutoDetect").trim(),
  pollIntervalMs: envInt("AZURE_VIDEO_INDEXER_POLL_MS", 7000),
  maxPolls: envInt("AZURE_VIDEO_INDEXER_MAX_POLLS", 22),
  timeoutMs: envInt("AZURE_VIDEO_INDEXER_TIMEOUT_MS", 30000)
};

const qwenVlConfig = {
  apiKey: String(process.env.QWEN_VL_API_KEY || process.env.DASHSCOPE_API_KEY || "").trim(),
  baseUrl: String(process.env.QWEN_VL_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/+$/, ""),
  model: String(process.env.QWEN_VL_MODEL || "qwen3-vl-plus").trim(),
  maxFrames: envInt("QWEN_VL_MAX_FRAMES", 8),
  timeoutMs: envInt("QWEN_VL_TIMEOUT_MS", 30000),
  maxImageWidth: envInt("QWEN_VL_MAX_IMAGE_WIDTH", 1280),
  minSceneGapSeconds: envInt("QWEN_VL_MIN_SCENE_GAP_SECONDS", 20)
};

const openAiConfig = {
  apiKey: String(process.env.OPENAI_API_KEY || "").trim(),
  baseUrl: String(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
  model: String(process.env.OPENAI_MODEL || "gpt-5.2").trim(),
  timeoutMs: envInt("OPENAI_TIMEOUT_MS", 30000),
  maxTranscriptWords: envInt("AI_ANALYSIS_MAX_TRANSCRIPT_WORDS", 5000)
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function json(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*"
  });
  res.end(JSON.stringify(payload));
}

function extractVideoId(input) {
  const value = String(input || "").trim();
  if (!value) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  const urlMatch = value.match(/(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\/[^\s"'<>]+/i);
  const candidate = urlMatch ? urlMatch[0] : value;
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    const fromQuery = url.searchParams.get("v");
    if (fromQuery && /^[a-zA-Z0-9_-]{11}$/.test(fromQuery)) return fromQuery;
    if (host.includes("youtu.be")) {
      const id = path.split("/").filter(Boolean)[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id || "")) return id;
    }
    const pathMatch = path.match(/\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})(?:[/?#]|$)/);
    if (pathMatch) return pathMatch[1];
  } catch {
    // Fall through to regex extraction below.
  }

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})(?:[&#]|$)/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})(?:[/?#]|$)/i,
    /youtube\.com\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})(?:[/?#]|$)/i
  ];
  for (const pattern of patterns) {
    const match = candidate.match(pattern) || value.match(pattern);
    if (match) return match[1];
  }

  const loose = value.match(/\b([a-zA-Z0-9_-]{11})\b/);
  if (loose) return loose[1];
  return null;
}

function extractBalancedJson(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = source.indexOf("{", markerIndex);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

function collectByKey(node, key, output = []) {
  if (!node || typeof node !== "object") return output;
  if (Object.prototype.hasOwnProperty.call(node, key)) output.push(node[key]);
  for (const value of Object.values(node)) {
    if (value && typeof value === "object") collectByKey(value, key, output);
  }
  return output;
}

function flattenText(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.simpleText) return node.simpleText;
  if (Array.isArray(node.runs)) return node.runs.map((run) => run.text || "").join("");
  return "";
}

function flattenAllText(nodes) {
  return nodes.map(flattenText).filter(Boolean).join(" ");
}

function parseViewCount(text) {
  const normalized = String(text || "").toLowerCase().replace(/\u00a0/g, " ");
  const compact = normalized.replace(/,/g, ".").replace(/\s+/g, " ");
  const rawNumber = (compact.match(/\d+(?:[ .]\d+)*/) || [0])[0];
  const number = Number(rawNumber.includes(".") && !/\d \d/.test(rawNumber)
    ? rawNumber
    : rawNumber.replace(/[ .]/g, ""));
  if (!number) return 0;
  if (/млрд|billion|bn/.test(compact)) return Math.round(number * 1_000_000_000);
  if (/млн|million|m\b/.test(compact)) return Math.round(number * 1_000_000);
  if (/тыс|thousand|k\b/.test(compact)) return Math.round(number * 1_000);
  return Math.round(number);
}

function formatViews(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} млрд`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} тыс`;
  return String(value || 0);
}

function normalizeSearchQuery(topic) {
  const value = String(topic || "").trim();
  if (!value) return "";
  return /обуч|урок|курс|tutorial|learn|lesson/i.test(value) ? value : `${value} обучение`;
}

function topicTokens(topic) {
  return String(topic || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .filter((token) => !["обучение", "урок", "курс", "для", "как", "learn", "tutorial", "lesson", "the", "and"].includes(token));
}

function queryDomain(query) {
  const value = String(query || "").toLowerCase();
  if (/физик|physics|механик|электродинамик|квант|термодинамик|егэ.*физ/.test(value)) return "physics";
  if (/математ|math|алгебр|геометр|calculus|егэ.*мат/.test(value)) return "math";
  if (/трейдинг|trading|бирж|крипт|инвест|акци|forex|форекс/.test(value)) return "trading";
  if (/python|javascript|typescript|react|node|программ|кодинг|разработ/.test(value)) return "programming";
  if (/sql|postgres|mysql|баз[аы] данных|database/.test(value)) return "database";
  if (/ux|ui|дизайн|интерфейс|figma|product design/.test(value)) return "ux";
  if (/нейро|нейросет|\bai\b|\bml\b|machine learning|искусственн|llm|chatgpt/.test(value)) return "ai";
  if (/англий|english|ielts|toefl|grammar|vocabulary|немец|deutsch|испан|француз|япон|китай|иностранн.*язык/.test(value)) return "language";
  return "general";
}

function matchesDomain(video, domain) {
  const value = `${video.title || ""} ${video.description || ""}`.toLowerCase();
  const rules = {
    physics: {
      required: /физик|physics|механик|электродинамик|квант|термодинамик|егэ.*физ/,
      forbidden: /англий|english|иностранн.*язык|трейдинг|trading|бирж|крипт|python|javascript|программ|нейро|нейросет|ии|искусственн|machine learning|chatgpt|llm|ux|figma|sql/
    },
    math: {
      required: /математ|math|алгебр|геометр|calculus|егэ.*мат/,
      forbidden: /англий|english|иностранн.*язык|трейдинг|trading|бирж|крипт|python|javascript|нейро|нейросет|ии|искусственн|machine learning|chatgpt|llm|ux|figma/
    },
    language: {
      required: /англий|english|ielts|toefl|grammar|vocabulary|немец|deutsch|испан|француз|япон|китай|иностранн.*язык/,
      forbidden: /язык программирован|programming language|python|javascript|typescript|react|node|программ|кодинг|код\b|разработ|нейро|нейросет|machine learning|трейдинг|trading|бирж|крипт|физик|математ/
    },
    trading: {
      required: /трейдинг|trading|бирж|крипт|инвест|акци|forex|форекс/,
      forbidden: /англий|english|иностранн.*язык|программ|python|javascript|нейро|нейросет|machine learning|физик|математ|ux|figma/
    },
    programming: {
      required: /python|javascript|typescript|react|node|программ|кодинг|разработ/,
      forbidden: /англий|english|ielts|toefl|grammar|vocabulary|немец|deutsch|испан|француз|япон|китай|иностранн.*язык|трейдинг|trading|бирж|крипт|нейро|нейросет|machine learning|физик|математ|ux|figma/
    },
    database: {
      required: /sql|postgres|mysql|баз[аы] данных|database|таблиц|join/,
      forbidden: /англий|english|иностранн.*язык|трейдинг|trading|нейро|нейросет|физик|математ|ux|figma/
    },
    ux: {
      required: /ux|ui|дизайн|интерфейс|figma|product design|продукт/,
      forbidden: /англий|english|иностранн.*язык|трейдинг|trading|sql|python|нейро|нейросет|физик|математ/
    },
    ai: {
      required: /нейро|нейросет|\bai\b|\bml\b|machine learning|искусственн|chatgpt|llm/,
      forbidden: /англий|english|иностранн.*язык|трейдинг|trading|ux|figma|физик|математ/
    }
  };
  const rule = rules[domain];
  if (!rule) return true;
  return rule.required.test(value) && !rule.forbidden.test(value);
}

const topicClassificationRules = [
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
    include: [[/трейдинг|trading|бирж|крипт|криптовалют|инвест|акци[ия]|forex|форекс|фьючерс|скальпинг|теханализ|техническ[а-я\s]+анализ/i, "трейдинг/инвестиции"]],
    exclude: [/англий|english|язык программирован|python|javascript|нейросет|machine learning|физик|математ|ux|figma/i]
  },
  {
    id: "database",
    label: "Базы данных",
    benchmark: "обучение SQL",
    include: [[/\bsql\b|postgres|mysql|sqlite|баз[аы]\s+данных|database|join|индекс[ыа]?|таблиц[аы]\s+sql/i, "SQL/базы данных"]],
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
    include: [[/\bux\b|\bui\b|figma|дизайн интерфейс|продуктов[а-я\s]+дизайн|user research|исследован[а-я\s]+пользовател|прототип|юзабилити/i, "UX/UI дизайн"]],
    exclude: [/англий|english|sql|python|javascript|нейросет|machine learning|трейдинг|физик|математ/i]
  },
  {
    id: "ai",
    label: "AI и машинное обучение",
    benchmark: "обучение нейросетям",
    include: [[/\bai\b|\bml\b|machine learning|deep learning|llm|chatgpt|нейро|нейросет|искусственн[а-я\s]+интеллект|машинн[а-я\s]+обучен|больш[а-я\s]+языков[а-я\s]+модел/i, "AI/машинное обучение"]],
    exclude: [/английск|english|ielts|toefl|иностранн[а-я\s]+язык|трейдинг|trading|ux|figma|физик|математ/i]
  },
  {
    id: "marketing",
    label: "Маркетинг и продажи",
    benchmark: "обучение маркетингу",
    include: [[/маркетинг|продаж[аи]|воронк[аи]|таргет|smm|реклам[аи]|лидогенерац|оффер|копирайтинг/i, "маркетинг/продажи"]],
    exclude: [/физик|математ|англий|english|python|javascript|нейросет|ux|figma|трейдинг/i]
  },
  {
    id: "learning-methodology",
    label: "Методология обучения",
    benchmark: "методология обучения",
    include: [[/методолог[а-я\s]+обучен|педагогик|дидактик|instructional design|learning design|когнитивн[а-я\s]+нагрузк|образовательн[а-я\s]+дизайн|green argus/i, "методология обучения"]],
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

function topicSpecificBenchmark(rule, text) {
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

function classifyVideoTopic(input = {}) {
  const sources = [
    { label: "название", weight: 5, text: normalizeTopicText(input.title) },
    { label: "описание/главы", weight: 2.6, text: normalizeTopicText(input.description) },
    { label: "OCR/экран", weight: 2.2, text: normalizeTopicText(input.ocr) },
    { label: "субтитры", weight: 1.4, text: normalizeTopicText(input.transcript) }
  ];
  const scored = topicClassificationRules.map((rule) => {
    let score = 0;
    const evidence = [];
    for (const source of sources) {
      if (!source.text) continue;
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

  const allText = sources.map((source) => source.text).join(" ");
  return {
    id: best.id,
    label: best.label,
    benchmark: topicSpecificBenchmark(best, allText),
    score: Number(best.score.toFixed(1)),
    confidence: best.score >= 9 && margin >= 3 ? "высокая" : "средняя",
    evidence: best.evidence.slice(0, 6),
    alternatives: scored.slice(1, 4).map((item) => ({ id: item.id, label: item.label, score: Number(item.score.toFixed(1)) }))
  };
}

function isRelevantEducationalResult(video, query) {
  const tokens = topicTokens(query);
  const haystack = `${video.title || ""} ${video.description || ""}`.toLowerCase();
  const hasSubject = !tokens.length || tokens.some((token) => {
    const stem = token.length > 5 ? token.slice(0, 5) : token;
    return haystack.includes(token) || haystack.includes(stem);
  });
  const hasInstructionalFormat = /обуч|урок|курс|лекци|семинар|tutorial|lesson|course/i.test(haystack);
  const hasMethod = /разбор|разбер|решим|решаем|пример|пошаг|шаг за шагом|метод|формул|алгоритм|how to|step by step/i.test(haystack);
  const hasPractice = /практи|задани|упраж|домашн|проверь|проверка|тест|решите|попробуйте|practice|exercise|quiz/i.test(haystack);
  const hasGoal = /цель урока|вы научитесь|научимся|после урока|сможете|навык|учебн|learning objective/i.test(haystack);
  const hasTeachingCore = hasMethod || hasGoal || /подробно объясн|темы.*рассмотр|план урока|содержание урока/i.test(haystack);
  const infotainment = /интервью|подкаст|новост|реакц|vlog|развлекатель|документальн|документалк|интересные факты|топ фактов|обзор событий|биограф|мнение|приятного просмотра|семейный канал|детский канал|мультфильм|сборник серий/i.test(haystack);
  const onlyHomeworkOrViewing = hasPractice && !hasTeachingCore && /домашнее задание|делаем.*задани|приятного просмотра|семейный канал|детский канал/i.test(haystack);
  const evidenceCount = [hasInstructionalFormat, hasMethod, hasPractice, hasGoal].filter(Boolean).length;
  const educational = evidenceCount >= 2 && hasTeachingCore && !onlyHomeworkOrViewing && !(infotainment && !hasTeachingCore);
  return hasSubject && educational && matchesDomain(video, queryDomain(query));
}

function decodeEntities(text) {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function secondsToTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const head = hours ? `${String(hours).padStart(2, "0")}:` : "";
  return `${head}${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function parseTimestamp(value) {
  const parts = value.split(":").map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function classifySegment(text) {
  const value = text.toLowerCase();
  if (/задани|упражнен|практи|проверь|сделайте|повторите|practice|exercise|quiz|try it/.test(value)) return "практика";
  if (/например|пример|кейс|разбер|example|case|demo/.test(value)) return "пример";
  if (/итог|вывод|повторим|резюм|recap|summary|final words|conclusion/.test(value)) return "вывод";
  if (/купи|скидк|подпиш|курс|марафон|оффер/.test(value)) return "продажа";
  return "теория";
}

function segmentEvidence(text) {
  const value = text.toLowerCase();
  const hits = [
    /термин|понятие|принцип|метод|формул|правил|алгоритм|переменн|тип|строк|условн|оператор|цикл|функц|класс|объект|массив|список|словар|кор[её]н|дроб|уравнен|неравенств|concept|principle|method|formula|algorithm|variable|type|string|condition|operator|loop|function|class|object|array|list|dictionary|notation|linear algebra|neuron|layer|weight|bias/.test(value),
    /например|пример|кейс|разбер|покаж|example|case|demo|introducing|what are|why/.test(value),
    /задани|упражнен|практи|проверь|решите|попробуйте|practice|exercise|quiz|try it/.test(value),
    /источник|исслед|данные|доказ|ссылка|source|research|data|book|paper/.test(value),
    /сначала|затем|итог|вывод|следующ|переходим|preview|recap|summary|conclusion|final/.test(value)
  ].filter(Boolean).length;
  const score = Math.max(1, Math.min(10, 2 + hits * 1.6 + Math.min(text.length / 450, 2)));
  const labels = [];
  if (/термин|понятие|принцип|метод|формул|правил|алгоритм|переменн|тип|строк|условн|оператор|цикл|функц|класс|объект|массив|список|словар|кор[её]н|дроб|уравнен|неравенств|concept|principle|method|formula|algorithm|variable|type|string|condition|operator|loop|function|class|object|array|list|dictionary|notation|linear algebra|neuron|layer|weight|bias/.test(value)) labels.push("понятия/метод");
  if (/например|пример|кейс|разбер|покаж|example|case|demo|introducing|what are|why/.test(value)) labels.push("пример");
  if (/задани|упражнен|практи|проверь|решите|попробуйте|practice|exercise|quiz|try it/.test(value)) labels.push("практика");
  if (/источник|исслед|данные|доказ|ссылка|source|research|data|book|paper/.test(value)) labels.push("источники");
  if (/сначала|затем|итог|вывод|следующ|переходим|preview|recap|summary|conclusion|final/.test(value)) labels.push("структура");
  return {
    score: Number(score.toFixed(1)),
    evidence: labels.length ? labels.join(", ") : "смысловой фрагмент без явных учебных маркеров"
  };
}

function cleanSegmentText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function buildSegment(start, end, text, source = "captions", topic = "") {
  const clean = cleanSegmentText(text);
  const evidence = segmentEvidence(clean);
  return {
    time: `${secondsToTime(start)}-${secondsToTime(end)}`,
    type: classifySegment(clean || topic),
    note: clean.slice(0, 170) || "Фрагмент выделен автоматически.",
    source,
    topic: topic || clean.split(/[.!?]/)[0]?.slice(0, 80) || "",
    score: evidence.score,
    evidence: evidence.evidence
  };
}

function parseDescriptionChapters(description, videoDuration = 0) {
  const lines = description.split(/\r?\n/);
  const chapters = [];
  for (const line of lines) {
    const match = line.match(/(?:^|\s)(\d{1,2}:\d{2}(?::\d{2})?)\s*[-—–:|)]?\s*(.+)$/);
    if (!match) continue;
    const start = parseTimestamp(match[1]);
    const title = match[2].trim().replace(/^[-—–:|)\s]+/, "");
    if (start === null || !title || /https?:\/\//i.test(title)) continue;
    chapters.push({ start, title });
  }
  const unique = chapters
    .filter((chapter, index, list) => list.findIndex((item) => item.start === chapter.start) === index)
    .sort((a, b) => a.start - b.start);
  if (unique.length < 2 && !(unique.length === 1 && unique[0].start === 0)) return [];
  return unique.map((chapter, index) => {
    const next = unique[index + 1]?.start;
    const fallbackEnd = videoDuration && videoDuration > chapter.start ? videoDuration : chapter.start + 60;
    return {
      ...chapter,
      end: next || fallbackEnd
    };
  }).filter((chapter) => chapter.end > chapter.start);
}

function buildChapterSegments(chapters) {
  const segments = [];
  for (const chapter of chapters) {
    const duration = chapter.end - chapter.start;
    const chunkCount = Math.max(1, Math.ceil(duration / 90));
    for (let chunk = 0; chunk < chunkCount; chunk += 1) {
      const start = chapter.start + Math.floor(duration * chunk / chunkCount);
      const end = chunk === chunkCount - 1
        ? chapter.end
        : chapter.start + Math.floor(duration * (chunk + 1) / chunkCount);
      const suffix = chunkCount > 1 ? `, часть ${chunk + 1}` : "";
      segments.push(buildSegment(
        start,
        end,
        `Тема из описания YouTube: ${chapter.title}${suffix}`,
        "description",
        chapter.title
      ));
    }
  }
  return segments.slice(0, 36);
}

function buildDurationSegments(duration, reason = "Сегмент построен по длительности ролика") {
  const safeDuration = Math.max(60, Number(duration || 0));
  const segments = [];
  let start = 0;
  while (start < safeDuration && segments.length < 36) {
    const remaining = safeDuration - start;
    const length = remaining <= 90 ? remaining : 75;
    const end = Math.min(safeDuration, start + Math.max(30, length));
    segments.push({
      time: `${secondsToTime(start)}-${secondsToTime(end)}`,
      type: "видео-анализ",
      note: reason,
      source: "media"
    });
    start = end;
  }
  return segments;
}

function chooseStreamUrl(streamingData = {}) {
  const formats = [...(streamingData.formats || []), ...(streamingData.adaptiveFormats || [])];
  const direct = formats
    .filter((format) => format.url && /video\/mp4/.test(format.mimeType || ""))
    .sort((a, b) => (Number(a.width || 9999) - Number(b.width || 9999)));
  return direct[0]?.url || "";
}

function chooseAudioStreamUrl(streamingData = {}) {
  const formats = [...(streamingData.formats || []), ...(streamingData.adaptiveFormats || [])];
  const direct = formats
    .filter((format) => format.url && /^audio\//.test(format.mimeType || ""))
    .sort((a, b) => Number(b.bitrate || 0) - Number(a.bitrate || 0));
  return direct[0]?.url || "";
}

function pickYtDlpFormat(formats = [], kind) {
  const list = formats.filter((format) => format.url);
  if (kind === "audio") {
    return list
      .filter((format) => format.acodec && format.acodec !== "none")
      .filter((format) => !format.vcodec || format.vcodec === "none")
      .sort((a, b) => Number(b.abr || b.tbr || 0) - Number(a.abr || a.tbr || 0))[0] || null;
  }
  return list
    .filter((format) => format.vcodec && format.vcodec !== "none")
    .sort((a, b) => {
      const aMp4 = formatExtScore(a);
      const bMp4 = formatExtScore(b);
      if (aMp4 !== bMp4) return bMp4 - aMp4;
      const aHeight = Number(a.height || 0);
      const bHeight = Number(b.height || 0);
      const aTarget = aHeight > 720 ? 720 - (aHeight - 720) : aHeight;
      const bTarget = bHeight > 720 ? 720 - (bHeight - 720) : bHeight;
      return bTarget - aTarget;
    })[0] || null;
}

function formatExtScore(format) {
  const value = `${format.ext || ""} ${format.protocol || ""} ${format.format_note || ""}`.toLowerCase();
  if (/mp4|https/.test(value)) return 2;
  if (/webm/.test(value)) return 1;
  return 0;
}

async function resolveYtDlpStreams(videoUrl) {
  const attempts = [
    { command: "yt-dlp", args: ["-J", "--no-playlist", "--extractor-args", "youtube:player_client=android", videoUrl], label: "yt-dlp android" },
    { command: "python3", args: ["-m", "yt_dlp", "-J", "--no-playlist", "--extractor-args", "youtube:player_client=android", videoUrl], label: "python3 -m yt_dlp android" },
    { command: "yt-dlp", args: ["-J", "--no-playlist", videoUrl], label: "yt-dlp" },
    { command: "python3", args: ["-m", "yt_dlp", "-J", "--no-playlist", videoUrl], label: "python3 -m yt_dlp" }
  ];
  const warnings = [];
  for (const attempt of attempts) {
    try {
      const { stdout } = await execFilePromise(attempt.command, attempt.args, {
        timeout: 60000,
        maxBuffer: 1024 * 1024 * 24
      });
      const data = JSON.parse(stdout);
      const audioFormat = pickYtDlpFormat(data.formats || [], "audio");
      const videoFormat = pickYtDlpFormat(data.formats || [], "video");
      return {
        available: true,
        source: attempt.label,
        audioUrl: audioFormat?.url || (videoFormat?.acodec && videoFormat.acodec !== "none" ? videoFormat.url : ""),
        videoUrl: videoFormat?.url || "",
        audioHeaders: audioFormat?.http_headers || videoFormat?.http_headers || data.http_headers || {},
        videoHeaders: videoFormat?.http_headers || data.http_headers || {},
        warnings
      };
    } catch (error) {
      warnings.push(`${attempt.label}: ${error.message}`);
    }
  }
  return {
    available: false,
    source: "",
    audioUrl: "",
    videoUrl: "",
    audioHeaders: {},
    videoHeaders: {},
    warnings: ["yt-dlp недоступен; прямые аудио/видео потоки не удалось получить.", ...warnings]
  };
}

function execFilePromise(file, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(file, args, { timeout: 45000, maxBuffer: 1024 * 1024 * 8, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function ffmpegInputArgs(url, headers = {}) {
  const merged = {
    "User-Agent": "Mozilla/5.0 GreenA/1.0",
    Referer: "https://www.youtube.com/",
    ...headers
  };
  const headerText = Object.entries(merged)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\r\n");
  return [
    "-user_agent", String(merged["User-Agent"] || "Mozilla/5.0 GreenA/1.0"),
    "-headers", `${headerText}\r\n`,
    "-i", url
  ];
}

async function hasCommand(command) {
  for (const args of [["-version"], ["--version"]]) {
    try {
      await execFilePromise(command, args, { timeout: 5000, maxBuffer: 1024 * 128 });
      return true;
    } catch {
      // Try the next common version flag.
    }
  }
  return false;
}

function parseTimeRangeSeconds(value) {
  const parts = String(value || "").replace(/[–—]/g, "-").split("-").map((part) => part.trim());
  if (parts.length !== 2) return null;
  const start = parseTimestamp(parts[0]);
  const end = parseTimestamp(parts[1]);
  if (start === null || end === null || end <= start) return null;
  return { start, end, duration: end - start, midpoint: start + ((end - start) / 2) };
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

function scoreAudioLoudness(meanVolume) {
  if (!Number.isFinite(meanVolume)) return 5;
  if (meanVolume < -48) return 1.5;
  if (meanVolume < -38) return 3.5;
  if (meanVolume < -30) return 5.5;
  if (meanVolume > -6) return 4.5;
  if (meanVolume > -10) return 6.2;
  return 8.5;
}

async function analyzeAudioStream(audioUrl, duration, cues = [], headers = {}) {
  if (!audioUrl) {
    return {
      available: false,
      score: 5,
      speechScore: cues.length ? estimatePace(cues) : 5,
      warnings: ["Аудиопоток YouTube не найден в доступных данных."]
    };
  }
  if (!(await hasCommand("ffmpeg"))) {
    return {
      available: false,
      score: cues.length ? 7 : 5,
      speechScore: cues.length ? estimatePace(cues) : 5,
      warnings: ["ffmpeg не установлен на сервере, аудио-метрики недоступны."]
    };
  }
  const analysisLimit = Math.min(Math.max(Number(duration || 0), 60), 300);
  const args = [
    "-hide_banner",
    "-nostdin",
    "-t", String(analysisLimit),
    ...ffmpegInputArgs(audioUrl, headers),
    "-af", "silencedetect=noise=-35dB:d=0.8,volumedetect",
    "-f", "null",
    "-"
  ];
  try {
    const { stderr } = await execFilePromise("ffmpeg", args, { timeout: 55000, maxBuffer: 1024 * 1024 * 8 });
    const meanVolume = Number((stderr.match(/mean_volume:\s*(-?[0-9.]+)\s*dB/) || [])[1]);
    const maxVolume = Number((stderr.match(/max_volume:\s*(-?[0-9.]+)\s*dB/) || [])[1]);
    const starts = [...stderr.matchAll(/silence_start:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
    const ends = [...stderr.matchAll(/silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/g)].map((match) => ({
      end: Number(match[1]),
      duration: Number(match[2])
    }));
    const silenceSeconds = ends.reduce((sum, item) => sum + (Number.isFinite(item.duration) ? item.duration : 0), 0);
    const silenceRatio = Math.max(0, Math.min(1, silenceSeconds / analysisLimit));
    const loudnessScore = scoreAudioLoudness(meanVolume);
    const silenceScore = silenceRatio > 0.55 ? 2.5 : silenceRatio > 0.35 ? 5 : silenceRatio > 0.18 ? 7 : 8.5;
    const speechScore = cues.length ? estimatePace(cues) : silenceScore;
    const score = Math.max(0, Math.min(10, (loudnessScore * 0.55) + (silenceScore * 0.25) + (speechScore * 0.20)));
    const warnings = [];
    if (!Number.isFinite(meanVolume)) warnings.push("Не удалось прочитать среднюю громкость.");
    if (silenceRatio > 0.35) warnings.push("Много тишины или длинных пауз в анализируемом фрагменте.");
    if (Number.isFinite(maxVolume) && maxVolume > -1) warnings.push("Есть риск перегруза или клиппинга звука.");
    return {
      available: true,
      analyzedSeconds: analysisLimit,
      meanVolumeDb: Number.isFinite(meanVolume) ? Number(meanVolume.toFixed(1)) : null,
      maxVolumeDb: Number.isFinite(maxVolume) ? Number(maxVolume.toFixed(1)) : null,
      silenceSeconds: Number(silenceSeconds.toFixed(1)),
      silenceRatio: Number(silenceRatio.toFixed(2)),
      silenceEvents: starts.length,
      score: Number(score.toFixed(1)),
      speechScore,
      warnings
    };
  } catch (error) {
    return {
      available: false,
      score: cues.length ? 7 : 5,
      speechScore: cues.length ? estimatePace(cues) : 5,
      warnings: [`Не удалось выполнить аудио-анализ: ${error.message}`]
    };
  }
}

function scoreBrightness(value) {
  if (!Number.isFinite(value)) return 5;
  if (value < 35 || value > 225) return 3.5;
  if (value < 55 || value > 205) return 5.5;
  return 8;
}

function scoreContrast(value) {
  if (!Number.isFinite(value)) return 5;
  if (value < 18) return 3.5;
  if (value < 28) return 5.5;
  return 8;
}

async function analyzeVideoStream(videoUrl, duration, headers = {}) {
  if (!videoUrl) {
    return {
      available: false,
      score: 5,
      readabilityScore: 5,
      warnings: ["Видеопоток YouTube не найден в доступных данных."]
    };
  }
  if (!(await hasCommand("ffmpeg"))) {
    return {
      available: false,
      score: 5,
      readabilityScore: 5,
      warnings: ["ffmpeg не установлен на сервере, визуальные метрики недоступны."]
    };
  }
  const analysisLimit = Math.min(Math.max(Number(duration || 0), 60), 240);
  const args = [
    "-hide_banner",
    "-nostdin",
    "-t", String(analysisLimit),
    ...ffmpegInputArgs(videoUrl, headers),
    "-vf", "fps=1/20,scale=320:-1,showinfo",
    "-an",
    "-f", "null",
    "-"
  ];
  try {
    const { stderr } = await execFilePromise("ffmpeg", args, { timeout: 55000, maxBuffer: 1024 * 1024 * 8 });
    const frameMatches = [...stderr.matchAll(/pts_time:([0-9.]+).*?mean:\[([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\].*?stdev:\[([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\]/g)];
    const frames = frameMatches.map((match) => ({
      time: secondsToTime(Number(match[1])),
      brightness: Number(match[2]),
      chromaU: Number(match[3]),
      chromaV: Number(match[4]),
      contrast: Number(match[5])
    }));
    const brightness = average(frames.map((frame) => frame.brightness));
    const contrast = average(frames.map((frame) => frame.contrast));
    const brightnessScore = scoreBrightness(brightness);
    const contrastScore = scoreContrast(contrast);
    const readabilityScore = Math.max(0, Math.min(10, (brightnessScore * 0.45) + (contrastScore * 0.55)));
    const score = readabilityScore;
    const warnings = [];
    if (!frames.length) warnings.push("Кадры не удалось измерить через showinfo.");
    if (brightnessScore < 6) warnings.push("Средняя яркость кадров может ухудшать читаемость.");
    if (contrastScore < 6) warnings.push("Низкий контраст может ухудшать читаемость текста и деталей.");
    return {
      available: frames.length > 0,
      analyzedSeconds: analysisLimit,
      frameCount: frames.length,
      averageBrightness: Number(brightness.toFixed(1)),
      averageContrast: Number(contrast.toFixed(1)),
      readabilityScore: Number(readabilityScore.toFixed(1)),
      score: Number(score.toFixed(1)),
      frames: frames.slice(0, 12).map((frame) => ({
        ...frame,
        brightness: Number(frame.brightness.toFixed(1)),
        contrast: Number(frame.contrast.toFixed(1))
      })),
      warnings
    };
  } catch (error) {
    return {
      available: false,
      score: 5,
      readabilityScore: 5,
      warnings: [`Не удалось выполнить видео-анализ: ${error.message}`]
    };
  }
}

async function extractFrameOcr(videoUrl, segments, duration, headers = {}, pageUrl = "") {
  if (!videoUrl && !pageUrl) {
    return { available: false, frames: [], text: "", warnings: ["Видеопоток для OCR недоступен."], source: "local-tesseract" };
  }
  if (!(await hasCommand("ffmpeg"))) {
    return { available: false, frames: [], text: "", warnings: ["ffmpeg не установлен, извлечение кадров для OCR недоступно."], source: "local-tesseract" };
  }
  const hasTesseract = await hasCommand("tesseract");
  if (!hasTesseract) {
    return { available: false, frames: [], text: "", warnings: ["tesseract не установлен, OCR текста на кадрах пропущен."], source: "local-tesseract" };
  }
  const ranges = (segments || [])
    .map((segment) => parseTimeRangeSeconds(segment.time))
    .filter(Boolean);
  const points = (ranges.length ? ranges : [{ midpoint: Math.min(30, Number(duration || 30)) }])
    .slice(0, 6)
    .map((range) => Math.max(1, Math.min(Number(duration || range.midpoint || 1), range.midpoint || 1)));
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "green-a-ocr-"));
  const frames = [];
  try {
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const framePath = path.join(tempDir, `frame-${index + 1}.jpg`);
      let frameSource = "ffmpeg-stream";
      try {
        if (!videoUrl) throw new Error("прямой видеопоток недоступен");
        await execFilePromise("ffmpeg", [
          "-hide_banner",
          "-nostdin",
          "-ss", String(point),
          ...ffmpegInputArgs(videoUrl, headers),
          "-frames:v", "1",
          "-vf", "scale=960:-1",
          "-q:v", "3",
          "-y",
          framePath
        ], { timeout: 25000, maxBuffer: 1024 * 1024 * 4 });
      } catch {
        const fallback = await extractFrameViaYtDlp(pageUrl, point, framePath);
        frameSource = fallback.source;
      }
      const stdout = await runTesseract(framePath);
      const text = cleanSegmentText(stdout).slice(0, 600);
      frames.push({
        time: secondsToTime(point),
        text,
        hasText: text.length > 12,
        source: frameSource
      });
    }
  } catch (error) {
    frames.push({
      time: "",
      text: "",
      hasText: false,
      source: "frame-ocr",
      warning: `OCR остановлен: ${error.message}`
    });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
  const text = frames.map((frame) => frame.text).filter(Boolean).join("\n");
  return {
    available: frames.some((frame) => frame.hasText),
    frames,
    text,
    warnings: frames.some((frame) => frame.warning) ? frames.map((frame) => frame.warning).filter(Boolean) : [],
    source: "local-tesseract"
  };
}

async function analyzeMediaStreams({ audioUrl, videoUrl, pageUrl, title, duration, cues, segments, mode, audioHeaders = {}, videoHeaders = {} }) {
  if (mode !== "stream") {
    return {
      audio: { available: false, score: cues.length ? estimatePace(cues) : 5, warnings: ["Медиа-анализ отключен в быстром режиме."] },
      video: { available: false, score: 5, readabilityScore: 5, warnings: ["Медиа-анализ отключен в быстром режиме."] },
      ocr: { available: false, frames: [], text: "", warnings: ["OCR отключен в быстром режиме."], source: "disabled-fast-mode" }
    };
  }
  const [audio, video] = await Promise.all([
    analyzeAudioStream(audioUrl, duration, cues, audioHeaders),
    analyzeVideoStream(videoUrl, duration, videoHeaders)
  ]);
  const localOcr = await extractFrameOcr(videoUrl, segments, duration, videoHeaders, pageUrl);
  let ocr = localOcr;
  let visualUnderstanding = {
    available: false,
    provider: "local",
    model: "",
    framesAnalyzed: 0,
    screenType: "unknown",
    visualLearningScore: 0,
    confidence: 0,
    visibleText: [],
    educationalSignals: [],
    negativeSignals: [],
    summary: "",
    warnings: []
  };
  if (canUseAzureVideoIndexer(mode)) {
    try {
      const azureOcr = await analyzeOcrViaAzureVideoIndexer({
        pageUrl,
        directVideoUrl: videoUrl,
        title
      });
      if (videoAnalysisProvider === "hybrid") {
        ocr = mergeOcrResults(localOcr, {
          ...azureOcr,
          source: "azure-video-indexer"
        });
      } else {
        const localWarnings = localOcr.available ? [] : (localOcr.warnings || []);
        ocr = {
          ...azureOcr,
          warnings: uniqueWarnings([...localWarnings, ...(azureOcr.warnings || [])]),
          source: "azure-video-indexer"
        };
      }
    } catch (error) {
      if (videoAnalysisProvider === "hybrid") {
        ocr = mergeOcrResults(localOcr, {
          available: false,
          frames: [],
          text: "",
          warnings: [`Azure Video Indexer OCR недоступен: ${error.message}`],
          source: "azure-video-indexer"
        });
      } else {
        ocr = {
          ...localOcr,
          warnings: uniqueWarnings([`Azure Video Indexer OCR недоступен: ${error.message}`, ...(localOcr.warnings || [])])
        };
      }
    }
  }
  if (["qwen", "hybrid"].includes(visionAnalysisProvider)) {
    if (canUseQwenVl(mode)) {
      try {
        visualUnderstanding = await analyzeFramesViaQwenVl({
          videoUrl,
          pageUrl,
          title,
          duration,
          segments,
          headers: videoHeaders
        });
        if (visionAnalysisProvider === "hybrid" || visionAnalysisProvider === "qwen") {
          ocr = mergeVisualUnderstandingIntoOcr(ocr, visualUnderstanding);
        }
      } catch (error) {
        visualUnderstanding = {
          ...visualUnderstanding,
          provider: "qwen-vl",
          model: qwenVlConfig.model,
          warnings: [`Qwen-VL недоступен: ${error.message}`]
        };
        if (visionAnalysisProvider === "qwen") {
          ocr = {
            ...ocr,
            warnings: uniqueWarnings([...(ocr.warnings || []), ...visualUnderstanding.warnings])
          };
        }
      }
    } else {
      visualUnderstanding = {
        ...visualUnderstanding,
        provider: "qwen-vl",
        model: qwenVlConfig.model,
        warnings: ["Qwen-VL не включен: задайте VISION_ANALYSIS_PROVIDER=qwen|hybrid и QWEN_VL_API_KEY."]
      };
    }
  }
  return { audio, video, ocr, visualUnderstanding };
}

function uniqueWarnings(warnings = []) {
  return [...new Set(warnings.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];
}

function mergeOcrResults(localOcr = {}, azureOcr = {}) {
  const localFrames = Array.isArray(localOcr.frames) ? localOcr.frames : [];
  const azureFrames = Array.isArray(azureOcr.frames) ? azureOcr.frames : [];
  const mergedFrameMap = new Map();

  for (const frame of [...azureFrames, ...localFrames]) {
    const time = String(frame?.time || "").trim();
    const text = cleanSegmentText(frame?.text || "").slice(0, 700);
    if (!time && !text) continue;
    const key = `${time}|${text.toLowerCase()}`;
    if (mergedFrameMap.has(key)) continue;
    mergedFrameMap.set(key, {
      time,
      text,
      hasText: Boolean(text && text.length > 8),
      source: frame?.source || (azureFrames.includes(frame) ? "azure-video-indexer" : "local-tesseract")
    });
  }

  const mergedFrames = [...mergedFrameMap.values()].slice(0, 18);
  const mergedTextMap = new Map();
  for (const frame of mergedFrames) {
    const text = cleanSegmentText(frame.text);
    if (!text) continue;
    const key = text.toLowerCase();
    if (!mergedTextMap.has(key)) mergedTextMap.set(key, text);
  }
  const mergedText = [...mergedTextMap.values()].join("\n");
  const mergedWarnings = uniqueWarnings([...(azureOcr.warnings || []), ...(localOcr.warnings || [])]);
  const azureAvailable = Boolean(azureOcr.available);
  const localAvailable = Boolean(localOcr.available);
  const source = azureAvailable && localAvailable
    ? "hybrid-azure-local"
    : (azureAvailable ? "azure-video-indexer" : "local-tesseract");

  return {
    available: azureAvailable || localAvailable || mergedFrames.some((frame) => frame.hasText),
    frames: mergedFrames,
    text: mergedText,
    warnings: mergedWarnings,
    source
  };
}

async function detectSceneSegments(streamUrl, duration, headers = {}) {
  if (!streamUrl || !duration) return [];
  const analysisLimit = Math.min(Number(duration), 1800);
  const args = [
    "-hide_banner",
    "-nostdin",
    "-t", String(analysisLimit),
    ...ffmpegInputArgs(streamUrl, headers),
    "-vf", "select='gt(scene,0.32)',showinfo",
    "-an",
    "-f", "null",
    "-"
  ];
  const { stderr } = await execFilePromise("ffmpeg", args);
  const cuts = [...stderr.matchAll(/pts_time:([0-9.]+)/g)]
    .map((match) => Number(match[1]))
    .filter((time) => Number.isFinite(time) && time > 5 && time < analysisLimit)
    .sort((a, b) => a - b);
  if (!cuts.length) return [];

  const points = [0];
  for (const cut of cuts) {
    const previous = points[points.length - 1];
    if (cut - previous >= 30) points.push(cut);
    if (cut - points[points.length - 1] > 90) points.push(points[points.length - 1] + 75);
  }
  if (analysisLimit - points[points.length - 1] >= 20) points.push(analysisLimit);
  const segments = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    let start = points[index];
    const finalEnd = points[index + 1];
    while (finalEnd - start > 90 && segments.length < 36) {
      const end = start + 75;
      segments.push({
        time: `${secondsToTime(start)}-${secondsToTime(end)}`,
        type: "видео-анализ",
        note: "Фрагмент выделен по видеоряду: длинный интервал между сменами сцен разделен автоматически.",
        source: "media"
      });
      start = end;
    }
    if (finalEnd - start >= 20 && segments.length < 36) {
      segments.push({
        time: `${secondsToTime(start)}-${secondsToTime(finalEnd)}`,
        type: "видео-анализ",
        note: "Фрагмент выделен по смене сцен в видеопотоке без сохранения файла.",
        source: "media"
      });
    }
  }
  return segments;
}

function buildSegments(cues) {
  if (!cues.length) return [{ time: "00:00-01:00", type: "данные", note: "Субтитры не найдены; требуется ручная проверка таймкодов." }];
  const segments = [];
  let start = cues[0].start;
  let end = start;
  let words = [];
  let previousCue = cues[0];
  for (const cue of cues) {
    const textSoFar = words.join(" ");
    const duration = Math.max(0, end - start);
    const gap = cue.start - (previousCue.start + previousCue.duration);
    const transition = /^(итак|теперь|далее|следующ|перейд|разбер|например|практик|задани|итог|вывод)/i.test(cue.text.trim());
    const shouldClose = words.length && duration >= 30 && (
      gap >= 2.8 ||
      (duration >= 55 && transition) ||
      (duration >= 75 && textSoFar.length > 220) ||
      duration >= 90
    );
    if (shouldClose) {
      const text = words.join(" ").trim();
      segments.push(buildSegment(start, end, text, "captions"));
      start = cue.start;
      words = [];
    }
    end = Math.max(end, cue.start + cue.duration);
    words.push(cue.text);
    previousCue = cue;
  }
  if (words.length) {
    const text = words.join(" ").trim();
    const last = buildSegment(start, end, text, "captions");
    const previous = segments[segments.length - 1];
    const rangeTooShort = end - start < 25;
    if (previous && rangeTooShort) {
      const previousRange = previous.time.split("-");
      previous.time = `${previousRange[0]}-${secondsToTime(end)}`;
      previous.note = cleanSegmentText(`${previous.note} ${text}`).slice(0, 170);
      const evidence = segmentEvidence(previous.note);
      previous.score = evidence.score;
      previous.evidence = evidence.evidence;
    } else {
      segments.push(last);
    }
  }
  return segments.slice(0, 36);
}

async function probeThumbnail(videoId) {
  const candidates = [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  ];
  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: { "user-agent": "Mozilla/5.0 GreenA/1.0" }
      });
      if (response.ok) {
        return {
          url,
          bytes: Number(response.headers.get("content-length") || 0),
          type: response.headers.get("content-type") || "image/jpeg"
        };
      }
    } catch {
      // Try the next thumbnail size.
    }
  }
  return null;
}

function estimateVisualSignals(description, transcript, thumbnail) {
  const text = `${description} ${transcript}`.toLowerCase();
  let video = thumbnail ? 7 : 5;
  let slides = 5;
  if (/слайд|презентац|таблиц|экран|доска|диаграм|схем|код|notebook|screen|slides/.test(text)) slides += 2;
  if (/плохой звук|плохо видно|размыто|шум|лаг/.test(text)) video -= 2;
  if (thumbnail?.bytes > 90000) video += 1;
  return {
    video: Math.max(0, Math.min(10, video)),
    slides: Math.max(0, Math.min(10, slides))
  };
}

function visualCueLabels(text) {
  const value = String(text || "").toLowerCase();
  const labels = [];
  if (/слайд|презентац|slides|slide/.test(value)) labels.push("слайды/презентация");
  if (/экран|демонстрац|screen|скрин|запись экрана/.test(value)) labels.push("демонстрация экрана");
  if (/доска|whiteboard|board/.test(value)) labels.push("доска");
  if (/(^|[^a-zа-я])код([^a-zа-я]|$)|python|javascript|\bsql\b|notebook|\bide\b|редактор кода|терминал|console/.test(value)) labels.push("код или рабочая среда");
  if (/таблиц|графики|график (функции|зависимости|на экране)|диаграм|chart|table|spreadsheet/.test(value)) labels.push("таблицы/графики");
  if (/формул|уравнен|задач|решени|математ|физик|formula|equation/.test(value)) labels.push("формулы/решение задач");
  if (/схем|mind map|карта|diagram|flow/.test(value)) labels.push("схема/диаграмма");
  if (/пример|разбор|практик|задани|упраж|demo|example|exercise/.test(value)) labels.push("визуальный пример или практика");
  return [...new Set(labels)];
}

function buildVisualObservation(segment, index, context) {
  const labels = visualCueLabels(`${segment.topic || ""} ${segment.type || ""} ${segment.note || ""} ${context.description}`);
  const noSpeech = !context.transcript;
  const sourceLabel = segment.source === "media"
    ? "кадр/сцена из видеоряда"
    : "визуальная проверка сегмента";
  const score = Math.max(1, Math.min(10,
    4.8 +
    Math.min(labels.length, 4) * 0.7 +
    (context.thumbnail ? 0.4 : 0) +
    (segment.source === "media" ? 0.4 : 0) +
    (noSpeech ? 0.5 : 0)
  ));
  const evidence = labels.length
    ? labels.join(", ")
    : (context.thumbnail ? "доступен thumbnail и таймкод сегмента" : "таймкод выделен, требуется проверка кадра");
  const fallbackNote = noSpeech
    ? "Речь/субтитры не найдены: при рейтинге этот фрагмент нужно оценивать по экрану, читаемости, действиям преподавателя, визуальным примерам и связности демонстрации."
    : "Проверить соответствие визуального ряда речи: экран, слайды, доска, примеры, читаемость и отсутствие визуальной перегрузки.";

  return {
    time: segment.time || `${secondsToTime(index * 60)}-${secondsToTime((index + 1) * 60)}`,
    type: sourceLabel,
    source: "visual",
    topic: segment.topic || segment.type || "",
    score: Number(score.toFixed(1)),
    evidence,
    note: labels.length
      ? `${fallbackNote} Обнаруженные визуальные маркеры: ${labels.join(", ")}.`
      : fallbackNote,
    thumbnail: context.thumbnail?.url || ""
  };
}

function buildVisualObservations({ segments, description, transcript, thumbnail, mediaAnalysis }) {
  const sourceSegments = Array.isArray(segments) ? segments.filter(Boolean) : [];
  const hasMediaFrames = Boolean(mediaAnalysis?.video?.frames?.length || mediaAnalysis?.ocr?.frames?.length);
  if (!sourceSegments.length && !thumbnail && !hasMediaFrames) return [];
  const context = {
    description: description || "",
    transcript: String(transcript || "").trim(),
    thumbnail
  };
  const limited = sourceSegments.length
    ? sourceSegments.slice(0, 12)
    : [{ time: "00:00-00:30", type: "thumbnail", note: "Доступен thumbnail YouTube.", source: "thumbnail" }];
  const observations = limited.map((segment, index) => buildVisualObservation(segment, index, context));
  const frameMetricObservations = (mediaAnalysis?.video?.frames || []).slice(0, 6).map((frame) => ({
    time: frame.time,
    type: "метрика кадра",
    source: "ffmpeg-frame",
    topic: "визуальное качество",
    score: mediaAnalysis.video.readabilityScore || mediaAnalysis.video.score || 5,
    evidence: `яркость ${frame.brightness}, контраст ${frame.contrast}`,
    note: "Кадр измерен через ffmpeg: яркость и контраст используются как грубая оценка читаемости экрана.",
    thumbnail: context.thumbnail?.url || ""
  }));
  const ocrObservations = (mediaAnalysis?.ocr?.frames || [])
    .filter((frame) => frame.hasText)
    .slice(0, 6)
    .map((frame) => ({
      time: frame.time,
      type: "OCR кадра",
      source: "frame-ocr",
      topic: "текст на экране",
      score: frame.text.length > 80 ? 8 : 6,
      evidence: "распознан текст на кадре",
      note: frame.text.slice(0, 220),
      thumbnail: context.thumbnail?.url || ""
    }));
  const qwen = mediaAnalysis?.visualUnderstanding;
  const qwenObservations = qwen?.available ? [{
    time: "кадры",
    type: "визуальное обучение",
    source: "qwen-vl",
    topic: qwen.screenType || "визуальный анализ",
    score: qwen.visualLearningScore || 0,
    evidence: [
      qwen.screenType ? `тип экрана: ${qwen.screenType}` : "",
      qwen.educationalSignals?.length ? `учебные признаки: ${qwen.educationalSignals.join(", ")}` : "",
      qwen.negativeSignals?.length ? `неучебные признаки: ${qwen.negativeSignals.join(", ")}` : ""
    ].filter(Boolean).join("; ") || "визуальный анализ Qwen-VL",
    note: qwen.summary || qwen.visibleText?.join("; ") || "Qwen-VL проанализировал ключевые кадры.",
    thumbnail: context.thumbnail?.url || ""
  }] : [];
  return [...observations, ...frameMetricObservations, ...ocrObservations, ...qwenObservations].slice(0, 24);
}

const defaultFetchHeaders = {
  "accept-language": "ru,en;q=0.8",
  "user-agent": "Mozilla/5.0 GreenA/1.0"
};

async function fetchText(url, options = {}) {
  const timeoutMs = Number(options.timeoutMs || 25000);
  const headers = { ...defaultFetchHeaders, ...(options.headers || {}) };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}${body ? `: ${body.slice(0, 220)}` : ""}`);
    }
    return response.text();
  } catch (error) {
    if (error?.name === "AbortError") throw new Error(`Таймаут запроса ${timeoutMs}ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, options = {}) {
  const text = await fetchText(url, options);
  if (!text.trim()) throw new Error("Пустой JSON-ответ");
  return JSON.parse(text);
}

function parseAzureTokenPayload(payload = "") {
  const raw = String(payload || "").trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed.trim();
    if (typeof parsed?.accessToken === "string") return parsed.accessToken.trim();
    if (typeof parsed?.token === "string") return parsed.token.trim();
  } catch {
    // Keep as plain text.
  }
  return raw.replace(/^"+|"+$/g, "").trim();
}

function parseVideoIndexerTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
  const match = raw.match(/^(\d+):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/);
  if (match) {
    if (match[3] == null) return (Number(match[1]) * 60) + Number(match[2]);
    return (Number(match[1]) * 3600) + (Number(match[2]) * 60) + Number(match[3]);
  }
  const iso = raw.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
  if (iso) {
    return (Number(iso[1] || 0) * 3600) + (Number(iso[2] || 0) * 60) + Number(iso[3] || 0);
  }
  return null;
}

function canUseAzureVideoIndexer(mode) {
  if (mode !== "stream") return false;
  if (!["azure", "hybrid"].includes(videoAnalysisProvider)) return false;
  return Boolean(
    azureVideoIndexerConfig.accountId &&
    azureVideoIndexerConfig.location &&
    (azureVideoIndexerConfig.accessToken || azureVideoIndexerConfig.subscriptionKey)
  );
}

async function getAzureVideoIndexerAccessToken() {
  if (azureVideoIndexerConfig.accessToken) return azureVideoIndexerConfig.accessToken;
  if (!azureVideoIndexerConfig.subscriptionKey) throw new Error("Не задан AZURE_VIDEO_INDEXER_SUBSCRIPTION_KEY.");
  const url = `${azureVideoIndexerConfig.baseUrl}/Auth/${encodeURIComponent(azureVideoIndexerConfig.location)}/Accounts/${encodeURIComponent(azureVideoIndexerConfig.accountId)}/AccessToken?allowEdit=true`;
  const payload = await fetchText(url, {
    timeoutMs: azureVideoIndexerConfig.timeoutMs,
    headers: { "Ocp-Apim-Subscription-Key": azureVideoIndexerConfig.subscriptionKey }
  });
  const token = parseAzureTokenPayload(payload);
  if (!token) throw new Error("Azure Video Indexer вернул пустой access token.");
  return token;
}

function extractAzureVideoId(payload = {}) {
  return payload?.id || payload?.videoId || payload?.Id || payload?.video?.id || "";
}

async function uploadVideoToAzureVideoIndexer(accessToken, videoUrl, videoName) {
  const url = new URL(`${azureVideoIndexerConfig.baseUrl}/${encodeURIComponent(azureVideoIndexerConfig.location)}/Accounts/${encodeURIComponent(azureVideoIndexerConfig.accountId)}/Videos`);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("name", (videoName || "YouTube video").slice(0, 80));
  url.searchParams.set("privacy", "Private");
  url.searchParams.set("indexingPreset", "Default");
  url.searchParams.set("streamingPreset", "NoStreaming");
  url.searchParams.set("language", azureVideoIndexerConfig.language || "AutoDetect");
  url.searchParams.set("videoUrl", videoUrl);
  const payload = await fetchJson(url.toString(), {
    method: "POST",
    timeoutMs: azureVideoIndexerConfig.timeoutMs,
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const id = extractAzureVideoId(payload);
  if (!id) throw new Error("Azure Video Indexer не вернул id видео после загрузки.");
  return id;
}

async function fetchAzureVideoIndexerIndex(accessToken, videoId) {
  const url = new URL(`${azureVideoIndexerConfig.baseUrl}/${encodeURIComponent(azureVideoIndexerConfig.location)}/Accounts/${encodeURIComponent(azureVideoIndexerConfig.accountId)}/Videos/${encodeURIComponent(videoId)}/Index`);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("includeSummarizedInsights", "true");
  return fetchJson(url.toString(), {
    timeoutMs: azureVideoIndexerConfig.timeoutMs,
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

function extractAzureOcrResult(indexData = {}) {
  const insights = indexData?.videos?.[0]?.insights || indexData?.videos?.insights || indexData?.insights || {};
  const ocrItems = Array.isArray(insights?.ocr) ? insights.ocr : [];
  const frames = ocrItems
    .map((item) => {
      const text = cleanSegmentText(
        item?.text ||
        item?.content ||
        (Array.isArray(item?.lines) ? item.lines.map((line) => line?.text || "").join(" ") : "")
      ).slice(0, 700);
      const startRaw = item?.instances?.[0]?.start || item?.instances?.[0]?.adjustedStart || item?.start || "";
      const startSeconds = parseVideoIndexerTime(startRaw);
      const time = Number.isFinite(startSeconds)
        ? secondsToTime(startSeconds)
        : "";
      return {
        time,
        text,
        hasText: text.length > 8,
        source: "azure-video-indexer"
      };
    })
    .filter((frame) => frame.text);
  const text = frames.map((frame) => frame.text).join("\n");
  return {
    available: frames.some((frame) => frame.hasText),
    frames: frames.slice(0, 12),
    text,
    warnings: frames.length ? [] : ["Azure Video Indexer не вернул OCR-текст по ролику."]
  };
}

async function analyzeOcrViaAzureVideoIndexer({ pageUrl, directVideoUrl, title }) {
  const sourceUrl = directVideoUrl || pageUrl;
  if (!sourceUrl) return { available: false, frames: [], text: "", warnings: ["Нет URL для Azure Video Indexer."] };
  const accessToken = await getAzureVideoIndexerAccessToken();
  const videoId = await uploadVideoToAzureVideoIndexer(accessToken, sourceUrl, title);
  let last = null;
  for (let poll = 0; poll < azureVideoIndexerConfig.maxPolls; poll += 1) {
    const indexData = await fetchAzureVideoIndexerIndex(accessToken, videoId);
    last = indexData;
    const state = String(indexData?.state || indexData?.videos?.[0]?.state || "").toLowerCase();
    if (/processed|indexed/.test(state)) {
      return {
        ...extractAzureOcrResult(indexData),
        warnings: []
      };
    }
    if (/failed|error/.test(state)) {
      throw new Error(`Azure Video Indexer завершил анализ со статусом "${state || "failed"}".`);
    }
    await new Promise((resolve) => setTimeout(resolve, azureVideoIndexerConfig.pollIntervalMs));
  }
  const state = String(last?.state || last?.videos?.[0]?.state || "").toLowerCase() || "timeout";
  throw new Error(`Azure Video Indexer не завершил обработку вовремя (последний статус: ${state}).`);
}

async function getOEmbed(videoUrl) {
  try {
    return await fetchJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(videoUrl)}`);
  } catch {
    return {};
  }
}

async function runTesseract(framePath) {
  const attempts = [
    ["-l", "rus+eng", "--psm", "6"],
    ["-l", "eng", "--psm", "6"],
    ["--psm", "6"]
  ];
  let lastError = null;
  for (const args of attempts) {
    try {
      const { stdout } = await execFilePromise("tesseract", [
        framePath,
        "stdout",
        ...args
      ], { timeout: 20000, maxBuffer: 1024 * 1024 * 2 });
      return stdout;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("tesseract не вернул текст");
}

async function extractFrameViaYtDlp(pageUrl, point, framePath) {
  if (!pageUrl) throw new Error("нет исходной ссылки YouTube для fallback OCR");
  const tempDir = path.dirname(framePath);
  const clipBase = path.join(tempDir, `clip-${Math.round(point * 10)}`);
  const sectionStart = Math.max(0, Number(point || 0) - 0.6);
  const sectionEnd = sectionStart + 1.4;
  const attempts = [
    {
      command: "yt-dlp",
      args: [
        "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        "--force-keyframes-at-cuts",
        "--download-sections", `*${sectionStart}-${sectionEnd}`,
        "-f", "best[height<=720]/best",
        "-o", `${clipBase}.%(ext)s`,
        pageUrl
      ],
      label: "yt-dlp section"
    },
    {
      command: "python3",
      args: [
        "-m", "yt_dlp",
        "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        "--force-keyframes-at-cuts",
        "--download-sections", `*${sectionStart}-${sectionEnd}`,
        "-f", "best[height<=720]/best",
        "-o", `${clipBase}.%(ext)s`,
        pageUrl
      ],
      label: "python3 -m yt_dlp section"
    }
  ];
  const warnings = [];
  for (const attempt of attempts) {
    try {
      await execFilePromise(attempt.command, attempt.args, { timeout: 70000, maxBuffer: 1024 * 1024 * 12 });
      const files = await fs.readdir(tempDir);
      const clip = files.find((file) => file.startsWith(path.basename(clipBase)) && !file.endsWith(".part"));
      if (!clip) throw new Error("yt-dlp не создал временный фрагмент");
      await execFilePromise("ffmpeg", [
        "-hide_banner",
        "-nostdin",
        "-i", path.join(tempDir, clip),
        "-frames:v", "1",
        "-vf", "scale=960:-1",
        "-q:v", "3",
        "-y",
        framePath
      ], { timeout: 25000, maxBuffer: 1024 * 1024 * 4 });
      return { source: attempt.label, warnings };
    } catch (error) {
      warnings.push(`${attempt.label}: ${error.message}`);
    }
  }
  throw new Error(`fallback через yt-dlp не извлек кадр: ${warnings.join("; ")}`);
}

function qwenFramePoints(segments = [], duration = 0, maxFrames = qwenVlConfig.maxFrames, minGap = qwenVlConfig.minSceneGapSeconds) {
  const safeDuration = Math.max(1, Number(duration || 0));
  const ranges = (segments || [])
    .map((segment) => parseTimeRangeSeconds(segment.time))
    .filter(Boolean);
  const candidates = ranges.length
    ? ranges.map((range) => clamp(range.midpoint || 1, 1, safeDuration))
    : Array.from({ length: Math.max(1, maxFrames) }, (_, index) => {
      const step = safeDuration / (Math.max(1, maxFrames) + 1);
      return clamp(Math.round(step * (index + 1)), 1, safeDuration);
    });
  const points = [];
  for (const point of candidates) {
    if (points.length >= maxFrames) break;
    if (points.some((item) => Math.abs(item - point) < minGap)) continue;
    points.push(point);
  }
  if (!points.length) points.push(Math.min(30, safeDuration));
  return points.slice(0, maxFrames);
}

async function extractVisionFrames(videoUrl, segments, duration, headers = {}, pageUrl = "") {
  if (!videoUrl && !pageUrl) {
    return { available: false, frames: [], warnings: ["Видеопоток для Qwen-VL недоступен."] };
  }
  if (!(await hasCommand("ffmpeg"))) {
    return { available: false, frames: [], warnings: ["ffmpeg не установлен, извлечение кадров для Qwen-VL недоступно."] };
  }
  const points = qwenFramePoints(segments, duration);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "green-a-qwen-vl-"));
  const frames = [];
  const warnings = [];
  try {
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const framePath = path.join(tempDir, `qwen-frame-${index + 1}.jpg`);
      let source = "ffmpeg-stream";
      try {
        if (!videoUrl) throw new Error("прямой видеопоток недоступен");
        await execFilePromise("ffmpeg", [
          "-hide_banner",
          "-nostdin",
          "-ss", String(point),
          ...ffmpegInputArgs(videoUrl, headers),
          "-frames:v", "1",
          "-vf", `scale='min(${qwenVlConfig.maxImageWidth},iw)':-1`,
          "-q:v", "4",
          "-y",
          framePath
        ], { timeout: 25000, maxBuffer: 1024 * 1024 * 4 });
      } catch (error) {
        const fallback = await extractFrameViaYtDlp(pageUrl, point, framePath);
        source = fallback.source;
        warnings.push(...(fallback.warnings || []), `Qwen-VL кадр ${index + 1}: прямой stream недоступен (${error.message}), использован fallback.`);
      }
      const bytes = await fs.readFile(framePath);
      frames.push({
        time: secondsToTime(point),
        imageUrl: `data:image/jpeg;base64,${bytes.toString("base64")}`,
        source
      });
    }
  } catch (error) {
    warnings.push(`Извлечение кадров для Qwen-VL остановлено: ${error.message}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
  return {
    available: frames.length > 0,
    frames,
    warnings: uniqueWarnings(warnings)
  };
}

function qwenVlPrompt() {
  return [
    "Analyze these sampled frames from a YouTube video for educational visual content.",
    "Distinguish real visual teaching from entertainment, vlogs, gameplay, reaction videos, movies, music videos, and generic talking-head content.",
    "Return strict JSON only:",
    "{",
    '  "has_visual_teaching": boolean,',
    '  "screen_type": "slides|code|whiteboard|demo|talking_head|game|movie|music_video|vlog|unknown",',
    '  "visible_text": ["..."],',
    '  "educational_visual_signals": ["diagrams", "formulas", "step_by_step", "examples", "code", "charts"],',
    '  "entertainment_visual_signals": ["vlog", "prank", "gameplay", "reaction", "music_video", "movie"],',
    '  "visual_learning_score": 0,',
    '  "confidence": 0,',
    '  "summary": "short explanation"',
    "}"
  ].join("\n");
}

function extractQwenMessageContent(payload = {}) {
  const content = payload?.choices?.[0]?.message?.content || payload?.output?.choices?.[0]?.message?.content || "";
  if (Array.isArray(content)) {
    return content.map((item) => item?.text || item?.content || "").join("\n");
  }
  return String(content || "");
}

function parseJsonObjectFromText(text = "") {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Qwen-VL вернул пустой ответ.");
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Qwen-VL вернул невалидный JSON.");
  }
}

function cleanStringArray(value = [], limit = 12) {
  const list = Array.isArray(value) ? value : [value];
  const map = new Map();
  for (const item of list) {
    const text = cleanSegmentText(item).slice(0, 220);
    if (!text) continue;
    const key = text.toLowerCase();
    if (!map.has(key)) map.set(key, text);
  }
  return [...map.values()].slice(0, limit);
}

function normalizeQwenVlResult(raw = {}, context = {}) {
  const visualLearningScore = Number(clamp(raw.visual_learning_score ?? raw.visualLearningScore ?? 0, 0, 10).toFixed(1));
  const confidence = Number(clamp(raw.confidence ?? 0, 0, 1).toFixed(2));
  const visibleText = cleanStringArray(raw.visible_text ?? raw.visibleText, 12);
  const educationalSignals = cleanStringArray(raw.educational_visual_signals ?? raw.educationalSignals, 12);
  const negativeSignals = cleanStringArray(raw.entertainment_visual_signals ?? raw.negativeSignals, 12);
  const screenType = cleanSegmentText(raw.screen_type || raw.screenType || "unknown").toLowerCase() || "unknown";
  const summary = cleanSegmentText(raw.summary || "").slice(0, 500);
  const hasVisualTeaching = Boolean(raw.has_visual_teaching ?? raw.hasVisualTeaching ?? visualLearningScore >= 6);
  return {
    available: Boolean(hasVisualTeaching || visualLearningScore > 0 || visibleText.length || educationalSignals.length || negativeSignals.length || summary),
    provider: "qwen-vl",
    model: context.model || qwenVlConfig.model,
    framesAnalyzed: Number(context.framesAnalyzed || 0),
    screenType,
    visualLearningScore,
    confidence,
    visibleText,
    educationalSignals,
    negativeSignals,
    summary,
    warnings: uniqueWarnings(context.warnings || [])
  };
}

function qwenVisualSummaryText(visual = {}) {
  const parts = [
    `Qwen-VL визуальный анализ: тип экрана ${visual.screenType || "unknown"}, visual learning score ${visual.visualLearningScore ?? 0}/10, уверенность ${visual.confidence ?? 0}.`,
    visual.summary ? `Вывод: ${visual.summary}` : "",
    visual.visibleText?.length ? `Текст на кадрах: ${visual.visibleText.join("; ")}` : "",
    visual.educationalSignals?.length ? `Учебные визуальные признаки: ${visual.educationalSignals.join(", ")}` : "",
    visual.negativeSignals?.length ? `Неучебные визуальные признаки: ${visual.negativeSignals.join(", ")}` : ""
  ];
  return parts.filter(Boolean).join("\n");
}

function mergeVisualUnderstandingIntoOcr(localOcr = {}, visualUnderstanding = {}) {
  if (!visualUnderstanding?.available) return localOcr;
  const qwenText = qwenVisualSummaryText(visualUnderstanding);
  const qwenFrame = {
    time: "",
    text: qwenText,
    hasText: Boolean(qwenText),
    source: "qwen-vl"
  };
  const frames = [...(Array.isArray(localOcr.frames) ? localOcr.frames : []), qwenFrame].filter((frame) => frame.text || frame.hasText);
  const text = [localOcr.text || "", qwenText].filter(Boolean).join("\n");
  const localSource = localOcr.source || "local-tesseract";
  return {
    ...localOcr,
    available: Boolean(localOcr.available || qwenText),
    frames,
    text,
    warnings: uniqueWarnings([...(localOcr.warnings || []), ...(visualUnderstanding.warnings || [])]),
    source: localOcr.available ? "hybrid-qwen-local" : "qwen-vl",
    localSource
  };
}

function canUseQwenVl(mode) {
  if (mode !== "stream") return false;
  if (!["qwen", "hybrid"].includes(visionAnalysisProvider)) return false;
  return Boolean(qwenVlConfig.apiKey && qwenVlConfig.baseUrl && qwenVlConfig.model);
}

async function analyzeFramesViaQwenVl({ videoUrl, pageUrl, title, duration, segments, headers = {} }) {
  const extracted = await extractVisionFrames(videoUrl, segments, duration, headers, pageUrl);
  if (!extracted.available) {
    return normalizeQwenVlResult({}, {
      model: qwenVlConfig.model,
      framesAnalyzed: 0,
      warnings: extracted.warnings
    });
  }
  const content = [
    { type: "text", text: `${qwenVlPrompt()}\n\nVideo title: ${title || "Unknown"}` },
    ...extracted.frames.map((frame) => ({
      type: "image_url",
      image_url: { url: frame.imageUrl }
    }))
  ];
  const payload = await fetchJson(`${qwenVlConfig.baseUrl}/chat/completions`, {
    method: "POST",
    timeoutMs: qwenVlConfig.timeoutMs,
    headers: {
      Authorization: `Bearer ${qwenVlConfig.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: qwenVlConfig.model,
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" }
    })
  });
  const parsed = parseJsonObjectFromText(extractQwenMessageContent(payload));
  return normalizeQwenVlResult(parsed, {
    model: qwenVlConfig.model,
    framesAnalyzed: extracted.frames.length,
    warnings: extracted.warnings
  });
}

function sampleWords(text = "", maxWords = openAiConfig.maxTranscriptWords) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  const head = words.slice(0, Math.floor(maxWords * 0.45));
  const remaining = words.slice(head.length);
  const chunkSize = Math.floor((maxWords - head.length) / 3);
  const chunks = [0.35, 0.6, 0.85].flatMap((ratio) => {
    const start = Math.max(0, Math.min(remaining.length - chunkSize, Math.floor(remaining.length * ratio)));
    return remaining.slice(start, start + chunkSize);
  });
  return [...head, ...chunks].slice(0, maxWords).join(" ");
}

function openAiEducationSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "education_score",
      "class",
      "confidence",
      "subject_area",
      "is_learning_format",
      "teaching_markers",
      "marketing_flags",
      "genre_flags",
      "reasoning_summary"
    ],
    properties: {
      education_score: { type: "integer", minimum: 0, maximum: 100 },
      class: { type: "string", enum: ["non-educational", "uncertain", "educational"] },
      confidence: { type: "string", enum: ["low", "medium", "high"] },
      subject_area: { type: "string", enum: ["STEM", "languages", "business", "humanities", "applied", "arts", "other"] },
      is_learning_format: { type: "boolean" },
      teaching_markers: { type: "array", items: { type: "string" } },
      marketing_flags: { type: "array", items: { type: "string" } },
      genre_flags: { type: "array", items: { type: "string" } },
      reasoning_summary: { type: "string" }
    }
  };
}

function openAiEducationPrompt() {
  return [
    "You are the Green Argus Education Filter.",
    "Decide whether a YouTube video has an educational format, not whether it is high quality.",
    "Prioritize explicit learning intent markers: обучение, урок, уроки, научить, learn, teach, lesson, tutorial, course, how to, guide, workshop, training, and equivalents in other languages.",
    "Marketing, quick promises, and sales language are flags for the quality evaluator. Do not reject a video solely because of marketing if it has a real teaching core.",
    "How-to instructions and practical step-by-step guides count as educational format.",
    "Entertainment, music, movies, vlogs, pranks, reactions, and gameplay are non-educational unless they contain a noticeable teaching core.",
    "Return only the JSON object matching the schema."
  ].join("\n");
}

function extractOpenAiOutputText(payload = {}) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const pieces = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") pieces.push(content.text);
      if (typeof content.output_text === "string") pieces.push(content.output_text);
    }
  }
  return pieces.join("\n");
}

function normalizeOpenAiEducationResult(raw = {}, context = {}) {
  const classification = ["non-educational", "uncertain", "educational"].includes(raw.class)
    ? raw.class
    : "uncertain";
  const confidence = ["low", "medium", "high"].includes(raw.confidence)
    ? raw.confidence
    : "medium";
  const subjectArea = ["STEM", "languages", "business", "humanities", "applied", "arts", "other"].includes(raw.subject_area)
    ? raw.subject_area
    : "other";
  const educationScore = Math.round(clamp(raw.education_score ?? 50, 0, 100));
  const reasoningSummary = cleanSegmentText(raw.reasoning_summary || "").slice(0, 700);
  const teachingMarkers = cleanStringArray(raw.teaching_markers, 18);
  const marketingFlags = cleanStringArray(raw.marketing_flags, 12);
  const genreFlags = cleanStringArray(raw.genre_flags, 12);
  return {
    available: true,
    provider: "openai",
    model: context.model || openAiConfig.model,
    educationScore,
    classification,
    confidence,
    subjectArea,
    isLearningFormat: Boolean(raw.is_learning_format),
    teachingMarkers,
    marketingFlags,
    genreFlags,
    reasoningSummary,
    warnings: uniqueWarnings(context.warnings || [])
  };
}

function unavailableOpenAiEducationResult(warnings = []) {
  return {
    available: false,
    provider: "openai",
    model: openAiConfig.model,
    educationScore: null,
    classification: "",
    confidence: "low",
    subjectArea: "other",
    isLearningFormat: false,
    teachingMarkers: [],
    marketingFlags: [],
    genreFlags: [],
    reasoningSummary: "",
    warnings: uniqueWarnings(warnings)
  };
}

function canUseOpenAiAnalysis() {
  if (!["openai", "hybrid"].includes(aiAnalysisProvider)) return false;
  return Boolean(openAiConfig.apiKey && openAiConfig.baseUrl && openAiConfig.model);
}

function buildOpenAiAnalysisInput({ title, description, transcript, ocr, visualText, segments, topicClassification }) {
  return {
    title,
    description,
    transcript_sample: sampleWords(transcript, openAiConfig.maxTranscriptWords),
    ocr_and_visual_sample: sampleWords(`${ocr || ""}\n${visualText || ""}`, 1500),
    topic: topicClassification?.label || "",
    topic_confidence: topicClassification?.confidence || "",
    segments: (segments || []).slice(0, 18).map((segment) => ({
      time: segment.time || "",
      type: segment.type || "",
      note: cleanSegmentText(segment.note || "").slice(0, 220),
      evidence: cleanSegmentText(segment.evidence || "").slice(0, 160)
    }))
  };
}

async function analyzeEducationViaOpenAi(input = {}) {
  if (!canUseOpenAiAnalysis()) {
    if (["openai", "hybrid"].includes(aiAnalysisProvider)) {
      return unavailableOpenAiEducationResult(["OpenAI AI-анализ не включен: задайте AI_ANALYSIS_PROVIDER=openai|hybrid и OPENAI_API_KEY."]);
    }
    return unavailableOpenAiEducationResult([]);
  }
  const payload = await fetchJson(`${openAiConfig.baseUrl}/responses`, {
    method: "POST",
    timeoutMs: openAiConfig.timeoutMs,
    headers: {
      Authorization: `Bearer ${openAiConfig.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: openAiConfig.model,
      input: [
        { role: "system", content: openAiEducationPrompt() },
        { role: "user", content: JSON.stringify(input) }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "green_argus_education_filter",
          strict: true,
          schema: openAiEducationSchema()
        }
      }
    })
  });
  const parsed = parseJsonObjectFromText(extractOpenAiOutputText(payload));
  return normalizeOpenAiEducationResult(parsed, { model: openAiConfig.model });
}

async function fetchYouTubeApiData(videoId) {
  if (!youtubeApiKey) return null;
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(youtubeApiKey)}`;
  try {
    const result = await fetchJson(apiUrl);
    return Array.isArray(result.items) && result.items.length ? result.items[0] : null;
  } catch {
    return null;
  }
}

function trackName(track) {
  return track?.name?.simpleText || flattenText(track?.name) || "";
}

function isAutomaticTrack(track) {
  return track?.kind === "asr" || /auto|automatic|авто/i.test(trackName(track));
}

function orderCaptionTracks(tracks = []) {
  const manual = tracks.filter((track) => !isAutomaticTrack(track));
  const automatic = tracks.filter(isAutomaticTrack);
  const score = (track) => {
    if (track.languageCode === "ru") return 0;
    if (track.languageCode === "en") return 1;
    if (/ru|russian|рус/i.test(trackName(track))) return 2;
    if (/en|english|англ/i.test(trackName(track))) return 3;
    return 4;
  };
  return [...manual.sort((a, b) => score(a) - score(b)), ...automatic.sort((a, b) => score(a) - score(b))]
    .map((track) => ({
      ...track,
      sourceType: isAutomaticTrack(track) ? "automatic" : "manual"
    }));
}

async function fetchCaptions(track) {
  if (!track?.baseUrl) return { transcript: "", cues: [] };
  let cues = [];
  try {
    const url = new URL(track.baseUrl);
    url.searchParams.set("fmt", "json3");
    const data = await fetchJson(url.toString());
    cues = cuesFromJson3(data);
  } catch {
    const text = await fetchText(track.baseUrl);
    cues = cuesFromXml(text);
    if (!cues.length && /WEBVTT/i.test(text)) cues = cuesFromVtt(text);
  }
  return captionResultFromCues(cues);
}

function cuesFromJson3(data = {}) {
  return (data.events || [])
    .filter((event) => Array.isArray(event.segs))
    .map((event) => ({
      start: Number(event.tStartMs || 0) / 1000,
      duration: Number(event.dDurationMs || 0) / 1000,
      text: decodeEntities(event.segs.map((seg) => seg.utf8 || "").join("").replace(/\s+/g, " ").trim())
    }))
    .filter((cue) => cue.text);
}

function cuesFromXml(xml = "") {
  return [...String(xml).matchAll(/<text start="([^"]+)"(?: dur="([^"]+)")?[^>]*>([\s\S]*?)<\/text>/g)]
    .map((match) => ({
      start: Number(match[1] || 0),
      duration: Number(match[2] || 0),
      text: decodeEntities(match[3].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    }))
    .filter((cue) => cue.text);
}

function parseVttTime(value = "") {
  const normalized = String(value).trim().replace(",", ".");
  const parts = normalized.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map(Number);
  if (nums.some((num) => Number.isNaN(num))) return null;
  if (parts.length === 2) return nums[0] * 60 + nums[1];
  return nums[0] * 3600 + nums[1] * 60 + nums[2];
}

function cuesFromVtt(vtt = "") {
  const lines = String(vtt).replace(/\r/g, "").split("\n");
  const cues = [];
  let index = 0;
  while (index < lines.length) {
    let line = lines[index].trim();
    if (!line || /^WEBVTT/i.test(line) || /^NOTE/i.test(line) || /^STYLE/i.test(line) || /^REGION/i.test(line)) {
      index += 1;
      continue;
    }
    if (!line.includes("-->")) {
      index += 1;
      line = (lines[index] || "").trim();
    }
    if (!line.includes("-->")) {
      index += 1;
      continue;
    }
    const [rawStart, rawEnd] = line.split("-->");
    const start = parseVttTime(rawStart);
    const end = parseVttTime((rawEnd || "").trim().split(/\s+/)[0]);
    index += 1;
    const textLines = [];
    while (index < lines.length && lines[index].trim() !== "") {
      textLines.push(lines[index].replace(/<[^>]+>/g, ""));
      index += 1;
    }
    const text = decodeEntities(textLines.join(" ").replace(/\s+/g, " ").trim());
    if (text && Number.isFinite(start) && Number.isFinite(end) && end > start) {
      cues.push({ start, duration: end - start, text });
    }
    index += 1;
  }
  return cues;
}

function captionResultFromCues(cues = []) {
  return {
    transcript: cues.map((cue) => cue.text).join(" ").replace(/\s+/g, " ").trim(),
    cues
  };
}

async function fetchCaptionFromUrl(url, ext = "") {
  const format = String(ext || "").toLowerCase();
  if (!url) return { transcript: "", cues: [] };
  try {
    if (format === "json3") {
      const data = await fetchJson(url);
      const cues = cuesFromJson3(data);
      return captionResultFromCues(cues);
    }
    const text = await fetchText(url);
    if (/WEBVTT/i.test(text) || format === "vtt") {
      const cues = cuesFromVtt(text);
      return captionResultFromCues(cues);
    }
    const cues = cuesFromXml(text);
    if (cues.length) return captionResultFromCues(cues);
    if (/^\s*\{/.test(text)) {
      const data = JSON.parse(text);
      return captionResultFromCues(cuesFromJson3(data));
    }
  } catch {
    // Fall through to empty result.
  }
  return { transcript: "", cues: [] };
}

function languageScore(code = "", preferred = []) {
  const value = String(code || "").toLowerCase();
  const direct = preferred.findIndex((item) => value === item);
  if (direct >= 0) return direct;
  const family = preferred.findIndex((item) => value.startsWith(`${item}-`) || value.startsWith(`${item}_`) || value.startsWith(item));
  if (family >= 0) return family + 0.2;
  if (value === "ru" || value.startsWith("ru-")) return 10;
  if (value === "en" || value.startsWith("en-")) return 11;
  return 20;
}

function extScore(ext = "") {
  const value = String(ext || "").toLowerCase();
  if (value === "json3") return 0;
  if (value === "srv3") return 1;
  if (value === "vtt") return 2;
  if (value === "ttml") return 3;
  if (value === "srv2") return 4;
  if (value === "srv1") return 5;
  return 9;
}

function flattenCaptionEntries(map = {}, sourceType = "automatic") {
  return Object.entries(map || {})
    .flatMap(([languageCode, entries]) => (entries || []).map((entry) => ({
      url: entry.url,
      ext: entry.ext || "",
      languageCode,
      sourceType
    })))
    .filter((entry) => entry.url);
}

function pickBestCaptionEntry(entries = [], preferredLanguages = []) {
  const preferred = preferredLanguages.map((value) => String(value || "").toLowerCase()).filter(Boolean);
  return entries
    .slice()
    .sort((a, b) => {
      const langDelta = languageScore(a.languageCode, preferred) - languageScore(b.languageCode, preferred);
      if (langDelta !== 0) return langDelta;
      return extScore(a.ext) - extScore(b.ext);
    })[0] || null;
}

async function fetchCaptionsViaYtDlp(videoUrl, preferredLanguages = []) {
  if (!videoUrl) return null;
  const attempts = [
    { command: "yt-dlp", args: ["-J", "--no-playlist", "--skip-download", "--extractor-args", "youtube:player_client=android", videoUrl], label: "yt-dlp json android" },
    { command: "python3", args: ["-m", "yt_dlp", "-J", "--no-playlist", "--skip-download", "--extractor-args", "youtube:player_client=android", videoUrl], label: "python3 -m yt_dlp json android" },
    { command: "yt-dlp", args: ["-J", "--no-playlist", "--skip-download", videoUrl], label: "yt-dlp json" },
    { command: "python3", args: ["-m", "yt_dlp", "-J", "--no-playlist", "--skip-download", videoUrl], label: "python3 -m yt_dlp json" }
  ];
  for (const attempt of attempts) {
    try {
      const { stdout } = await execFilePromise(attempt.command, attempt.args, { timeout: 65000, maxBuffer: 1024 * 1024 * 16 });
      const data = JSON.parse(stdout);
      const automatic = flattenCaptionEntries(data.automatic_captions || {}, "automatic");
      const manual = flattenCaptionEntries(data.subtitles || {}, "manual");
      const best = pickBestCaptionEntry([...automatic, ...manual], preferredLanguages);
      if (!best) continue;
      const result = await fetchCaptionFromUrl(best.url, best.ext);
      if (!result.transcript) continue;
      return {
        ...result,
        track: {
          baseUrl: best.url,
          languageCode: best.languageCode,
          sourceType: best.sourceType,
          name: { simpleText: `${best.languageCode} (${best.sourceType}, yt-dlp)` }
        }
      };
    } catch {
      // Try the next yt-dlp variant.
    }
  }
  return null;
}

function uniqueLanguageOrder(list = []) {
  const out = [];
  for (const value of list) {
    const code = String(value || "").trim().toLowerCase();
    if (!code) continue;
    if (!out.includes(code)) out.push(code);
  }
  return out;
}

async function fetchCaptionsViaTimedtext(videoId, preferredLanguages = []) {
  if (!videoId) return null;
  const languages = uniqueLanguageOrder([
    ...preferredLanguages,
    "ru",
    "en",
    "uk",
    "es",
    "pt",
    "de",
    "fr"
  ]);
  const bases = [
    "https://www.youtube.com/api/timedtext",
    "https://video.google.com/timedtext"
  ];
  const formats = ["json3", "vtt"];
  for (const lang of languages) {
    for (const base of bases) {
      for (const format of formats) {
        for (const kind of ["asr", ""]) {
          try {
            const url = new URL(base);
            url.searchParams.set("v", videoId);
            url.searchParams.set("lang", lang);
            url.searchParams.set("fmt", format);
            if (kind) url.searchParams.set("kind", kind);
            const result = await fetchCaptionFromUrl(url.toString(), format);
            if (!result.transcript || result.transcript.length < 30) continue;
            return {
              ...result,
              track: {
                baseUrl: url.toString(),
                languageCode: lang,
                sourceType: kind === "asr" ? "automatic" : "manual",
                name: { simpleText: `${lang} (${kind === "asr" ? "automatic" : "manual"}, timedtext)` }
              }
            };
          } catch {
            // Try next variant.
          }
        }
      }
    }
  }
  return null;
}

async function fetchBestCaptions(tracks, videoUrl = "") {
  for (const track of orderCaptionTracks(tracks)) {
    try {
      const result = await fetchCaptions(track);
      if (result.transcript) return { ...result, track };
    } catch {
      // Try the next manual or automatic caption track.
    }
  }
  const preferred = orderCaptionTracks(tracks).map((track) => track.languageCode).filter(Boolean);
  const timedtextResult = await fetchCaptionsViaTimedtext(extractVideoId(videoUrl), preferred);
  if (timedtextResult?.transcript) return timedtextResult;
  const ytDlpResult = await fetchCaptionsViaYtDlp(videoUrl, preferred);
  if (ytDlpResult?.transcript) return ytDlpResult;
  return { transcript: "", cues: [], track: orderCaptionTracks(tracks)[0] };
}

function estimatePace(cues) {
  if (cues.length < 2) return 8;
  const words = cues.reduce((sum, cue) => sum + cue.text.split(/\s+/).filter(Boolean).length, 0);
  const start = cues[0].start;
  const end = cues[cues.length - 1].start + cues[cues.length - 1].duration;
  const wpm = words / Math.max(1, (end - start) / 60);
  if (wpm < 95) return 5;
  if (wpm > 185) return 6;
  if (wpm > 220) return 3;
  return 8;
}

async function analyzeYouTube(inputUrl, mode = "stream") {
  const videoId = extractVideoId(inputUrl);
  if (!videoId) throw new Error("Не смог распознать YouTube ID");
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const [html, oembed, apiData] = await Promise.all([
    fetchText(videoUrl),
    getOEmbed(videoUrl),
    fetchYouTubeApiData(videoId)
  ]);
  const playerJson = extractBalancedJson(html, "ytInitialPlayerResponse");
  let player = {};
  try {
    player = playerJson ? JSON.parse(playerJson) : {};
  } catch {
    player = {};
  }
  const details = player.videoDetails || {};
  const snippet = apiData?.snippet || {};
  const micro = player.microformat?.playerMicroformatRenderer || {};
  const title = details.title || micro.title?.simpleText || snippet.title || oembed.title || "Без названия";
  const description = details.shortDescription || flattenText(micro.description) || snippet.description || "";
  const videoDuration = Number(details.lengthSeconds || micro.lengthSeconds || 0);
  const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  let streamUrl = chooseStreamUrl(player.streamingData || {});
  let audioUrl = chooseAudioStreamUrl(player.streamingData || {});
  let streamResolver = {
    available: Boolean(streamUrl || audioUrl),
    source: "ytInitialPlayerResponse",
    audioHeaders: {},
    videoHeaders: {},
    warnings: []
  };
  if (mode === "stream" && (!streamUrl || !audioUrl)) {
    const ytDlpStreams = await resolveYtDlpStreams(videoUrl);
    streamResolver = ytDlpStreams;
    streamUrl = streamUrl || ytDlpStreams.videoUrl;
    audioUrl = audioUrl || ytDlpStreams.audioUrl;
  }
  if (!audioUrl && streamUrl) audioUrl = streamUrl;
  const audioHeaders = streamResolver.audioHeaders || {};
  const videoHeaders = streamResolver.videoHeaders || {};
  const [{ transcript, cues, track }, thumbnail] = await Promise.all([
    fetchBestCaptions(tracks, videoUrl),
    mode === "stream" ? probeThumbnail(videoId) : Promise.resolve(null)
  ]);
  const chapters = parseDescriptionChapters(description, videoDuration);
  const chapterSegments = buildChapterSegments(chapters);
  let mediaSegments = [];
  if (!chapterSegments.length && !cues.length && mode === "stream") {
    try {
      mediaSegments = await detectSceneSegments(streamUrl, videoDuration, videoHeaders);
      if (!mediaSegments.length) {
        mediaSegments = buildDurationSegments(videoDuration, "Смены сцен не найдены; сегмент построен по длительности ролика.");
      }
    } catch {
      mediaSegments = buildDurationSegments(videoDuration, "Сцены не удалось извлечь из потока; сегмент построен по длительности ролика.");
    }
  }
  const chapterText = chapters.map((chapter) => `${secondsToTime(chapter.start)} ${chapter.title}`).join("\n");
  const combinedForTopic = `${title} ${description} ${chapterText} ${transcript}`;
  const visual = estimateVisualSignals(description, transcript, thumbnail);
  const segments = chapterSegments.length ? chapterSegments : (cues.length ? buildSegments(cues) : mediaSegments);
  const mediaAnalysis = await analyzeMediaStreams({
    audioUrl,
    videoUrl: streamUrl,
    pageUrl: videoUrl,
    title,
    duration: videoDuration,
    cues,
    segments,
    mode,
    audioHeaders,
    videoHeaders
  });
  const ocrProvider = mediaAnalysis.ocr?.source === "hybrid-azure-local"
    ? "hybrid"
    : (mediaAnalysis.ocr?.source === "azure-video-indexer" ? "azure-video-indexer" : (mediaAnalysis.ocr?.source === "qwen-vl" || mediaAnalysis.ocr?.source === "hybrid-qwen-local" ? mediaAnalysis.ocr.source : "local"));
  const visionProvider = mediaAnalysis.visualUnderstanding?.available
    ? "qwen-vl"
    : (visionAnalysisProvider === "local" ? "local" : "qwen-vl");
  const visualObservations = buildVisualObservations({ segments, description, transcript, thumbnail, mediaAnalysis });
  const signals = [
    "название и описание страницы YouTube",
    chapterSegments.length ? "главы и тематические таймкоды найдены в описании" : "",
    transcript && track?.sourceType === "manual" ? "ручные субтитры с таймкодами" : "",
    transcript && track?.sourceType === "automatic" ? "автоматические субтитры YouTube с таймкодами" : "",
    !transcript ? "ручные и автоматические субтитры не найдены" : "",
    mediaSegments.length ? "сегменты построены по видеопотоку без сохранения файла" : "",
    streamResolver.available ? `медиапотоки получены через ${streamResolver.source}` : "",
    mediaAnalysis.audio?.available ? "аудио-метрики рассчитаны через ffmpeg" : "",
    mediaAnalysis.video?.available ? "визуальные метрики кадров рассчитаны через ffmpeg" : "",
    mediaAnalysis.ocr?.available
      ? (ocrProvider === "azure-video-indexer"
        ? "OCR текста на кадрах выполнен через Azure AI Video Indexer"
        : (ocrProvider === "hybrid"
          ? "OCR текста на кадрах выполнен в гибридном режиме: Azure AI Video Indexer + локальный tesseract"
          : (ocrProvider === "qwen-vl" || ocrProvider === "hybrid-qwen-local"
            ? "визуальный OCR/анализ кадров дополнен через Qwen-VL"
            : "OCR текста на кадрах выполнен через tesseract")))
      : "",
    mediaAnalysis.visualUnderstanding?.available ? `Qwen-VL проанализировал ключевые кадры: ${mediaAnalysis.visualUnderstanding.framesAnalyzed}` : "",
    visualObservations.length ? "визуальные наблюдения добавлены в пакет рейтингования" : "",
    !transcript && visualObservations.length ? "включен fallback: оценка может опираться на экран и визуальные действия" : "",
    mode === "stream" && thumbnail ? "thumbnail проверен без сохранения файла" : "",
    cues.length ? "темп речи оценен по таймингам субтитров" : ""
  ].filter(Boolean);
  const visualText = visualObservations.map((item, index) => (
    `${index + 1}. ${item.time} | ${item.evidence} | ${item.note}${item.thumbnail ? ` | thumbnail: ${item.thumbnail}` : ""}`
  )).join("\n");
  const audioText = mediaAnalysis.audio?.available
    ? `Аудио: громкость ${mediaAnalysis.audio.meanVolumeDb ?? "н/д"} dB, тишина ${mediaAnalysis.audio.silenceRatio ?? "н/д"}, оценка ${mediaAnalysis.audio.score}/10. ${mediaAnalysis.audio.warnings?.join(" ") || ""}`
    : `Аудио: ${mediaAnalysis.audio?.warnings?.join(" ") || "метрики недоступны."}`;
  const videoText = mediaAnalysis.video?.available
    ? `Видео: яркость ${mediaAnalysis.video.averageBrightness ?? "н/д"}, контраст ${mediaAnalysis.video.averageContrast ?? "н/д"}, читаемость ${mediaAnalysis.video.readabilityScore}/10. ${mediaAnalysis.video.warnings?.join(" ") || ""}`
    : `Видео: ${mediaAnalysis.video?.warnings?.join(" ") || "метрики недоступны."}`;
  const ocrText = mediaAnalysis.ocr?.text
    ? `OCR кадров:\n${mediaAnalysis.ocr.text}`
    : `OCR кадров: ${mediaAnalysis.ocr?.warnings?.join(" ") || "текст на кадрах не распознан."}`;
  const topicClassification = classifyVideoTopic({
    title,
    description: `${description}\n${chapterText}`,
    transcript,
    ocr: `${mediaAnalysis.ocr?.text || ""}\n${visualText}`
  });
  let aiEducationAnalysis = unavailableOpenAiEducationResult([]);
  if (["openai", "hybrid"].includes(aiAnalysisProvider)) {
    try {
      aiEducationAnalysis = await analyzeEducationViaOpenAi(buildOpenAiAnalysisInput({
        title,
        description: `${description}\n${chapterText}`,
        transcript,
        ocr: mediaAnalysis.ocr?.text || "",
        visualText,
        segments,
        topicClassification
      }));
    } catch (error) {
      aiEducationAnalysis = unavailableOpenAiEducationResult([`OpenAI AI-анализ недоступен: ${error.message}`]);
    }
  }
  mediaAnalysis.aiEducation = aiEducationAnalysis;
  const ocrWarningText = (mediaAnalysis.ocr?.warnings || []).join(" ");
  const limitations = [
    mediaAnalysis.ocr?.available
      ? (ocrProvider === "azure-video-indexer"
        ? "OCR кадров выполнен через Azure AI Video Indexer; точность зависит от качества видео и статуса облачной обработки"
        : (ocrProvider === "hybrid"
          ? "OCR кадров выполнен в гибридном режиме (Azure + локальный OCR): выше полнота, но возможны дубли и шум."
          : (ocrProvider === "qwen-vl" || ocrProvider === "hybrid-qwen-local"
            ? "визуальный анализ кадров выполнен через Qwen-VL; результат зависит от качества выбранных кадров и ответа модели"
            : "OCR кадров выполнен локальным движком и может ошибаться на мелком, размытом или декоративном тексте")))
      : mode !== "stream"
        ? "OCR кадров отключен в быстром режиме"
        : /tesseract не установлен/i.test(ocrWarningText)
          ? "OCR кадров требует установленный tesseract; без него текст на экране не распознается"
          : "OCR кадров не получил читаемый текст или не смог извлечь кадры из YouTube-потока",
    mediaAnalysis.audio?.available
      ? "аудио-метрики отражают громкость и тишину, но не заменяют полноценную оценку дикции"
      : "качество звука оценено предварительно, потому что аудиопоток не был доступен для ffmpeg",
    mediaAnalysis.video?.available
      ? "визуальные метрики отражают яркость и контраст, но не заменяют полноценную vision-модель"
      : "качество видео оценено предварительно по доступным косвенным сигналам",
    aiEducationAnalysis.available
      ? "AI-анализ OpenAI используется как дополнительный классификатор образовательного формата; эвристики остаются fallback"
      : (aiEducationAnalysis.warnings?.join(" ") || ""),
    "комментарии YouTube не подключены; тематические таймкоды берутся из описания"
  ].filter(Boolean);
  const aiText = aiEducationAnalysis.available
    ? [
      `OpenAI Education Filter: ${aiEducationAnalysis.classification}, score ${aiEducationAnalysis.educationScore}/100, confidence ${aiEducationAnalysis.confidence}.`,
      `Предмет: ${aiEducationAnalysis.subjectArea}. Учебный формат: ${aiEducationAnalysis.isLearningFormat ? "да" : "нет"}.`,
      aiEducationAnalysis.teachingMarkers.length ? `Учебные маркеры: ${aiEducationAnalysis.teachingMarkers.join(", ")}` : "",
      aiEducationAnalysis.marketingFlags.length ? `Маркетинговые флаги: ${aiEducationAnalysis.marketingFlags.join(", ")}` : "",
      aiEducationAnalysis.genreFlags.length ? `Жанровые флаги: ${aiEducationAnalysis.genreFlags.join(", ")}` : "",
      aiEducationAnalysis.reasoningSummary ? `Объяснение: ${aiEducationAnalysis.reasoningSummary}` : ""
    ].filter(Boolean).join("\n")
    : (aiEducationAnalysis.warnings?.length ? `OpenAI Education Filter: ${aiEducationAnalysis.warnings.join(" ")}` : "");
  return {
    url: videoUrl,
    title,
    topic: topicClassification.label,
    topicClassification,
    topicSeed: combinedForTopic,
    description,
    transcript,
    ocr: [
      description,
      chapterText ? `\nГлавы из описания:\n${chapterText}` : "",
      topicClassification.label !== "Без темы" ? `\nТематика по данным ролика:\n${topicClassification.label}; уверенность: ${topicClassification.confidence}; признаки: ${topicClassification.evidence.join("; ") || "нет"}` : "\nТематика по данным ролика:\nне определена достаточно надежно",
      `\nМедиа-анализ:\n${audioText}\n${videoText}\n${ocrText}`,
      aiText ? `\nAI-анализ:\n${aiText}` : "",
      visualText ? `\nВизуальные наблюдения по экрану:\n${visualText}` : ""
    ].filter(Boolean).join("\n"),
    audio: mediaAnalysis.audio?.available ? mediaAnalysis.audio.score : (transcript ? 7 : 5),
    video: mediaAnalysis.video?.available ? Math.round(((visual.video + mediaAnalysis.video.score) / 2) * 10) / 10 : visual.video,
    slides: mediaAnalysis.video?.available ? Math.round(((visual.slides + mediaAnalysis.video.readabilityScore) / 2) * 10) / 10 : visual.slides,
    pace: mediaAnalysis.audio?.speechScore || estimatePace(cues),
    segments,
    visualObservations,
    mediaAnalysis,
    source: {
      videoId,
      mode,
      author: oembed.author_name || details.author || "",
      thumbnail,
      captionLanguage: track?.languageCode || "",
      captionType: track?.sourceType || "",
      captionName: trackName(track),
      chaptersFound: chapters.length,
      chapterSegments: chapterSegments.length,
      mediaSegments: mediaSegments.length,
      streamResolver: {
        available: Boolean(streamUrl || audioUrl),
        source: streamResolver.source || "",
        hasAudioUrl: Boolean(audioUrl),
        hasVideoUrl: Boolean(streamUrl),
        warnings: streamResolver.warnings || []
      },
      visualObservations: visualObservations.length,
      audioAnalyzed: Boolean(mediaAnalysis.audio?.available),
      videoAnalyzed: Boolean(mediaAnalysis.video?.available),
      ocrAnalyzed: Boolean(mediaAnalysis.ocr?.available),
      ocrProvider,
      visionAnalyzed: Boolean(mediaAnalysis.visualUnderstanding?.available),
      visionProvider,
      aiAnalyzed: Boolean(aiEducationAnalysis.available),
      aiProvider: aiEducationAnalysis.available ? "openai" : (aiAnalysisProvider === "local" ? "local" : "openai"),
      configuredAnalysisProvider: videoAnalysisProvider,
      configuredVisionProvider: visionAnalysisProvider,
      configuredAiProvider: aiAnalysisProvider,
      transcriptAvailable: Boolean(transcript),
      signals,
      limitations,
      note: transcript
        ? `Название, описание, ${track?.sourceType === "automatic" ? "автоматические" : "ручные"} субтитры и сегменты получены без сохранения видеофайла.`
        : "Название и описание получены автоматически, субтитры не найдены; рейтинг дополнен визуальным fallback по экрану и сценам."
    }
  };
}

function extractSearchVideos(initialData) {
  return collectByKey(initialData, "videoRenderer")
    .map((video) => {
      const videoId = video.videoId;
      const title = flattenText(video.title);
      const description = flattenAllText([
        video.descriptionSnippet,
        ...collectByKey(video.detailedMetadataSnippets || [], "snippetText")
      ]);
      const viewText = flattenText(video.viewCountText) || flattenText(video.shortViewCountText);
      const views = parseViewCount(viewText);
      return {
        videoId,
        title,
        description,
        views,
        viewText,
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""
      };
    })
    .filter((video) => video.videoId && video.title && video.views > 0);
}

async function findPopularCandidatesWithHtml(query, currentId) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAMSAhAB`;
  const html = await fetchText(searchUrl);
  const initialJson = extractBalancedJson(html, "ytInitialData");
  if (!initialJson) throw new Error("Не удалось прочитать выдачу YouTube.");
  const initialData = JSON.parse(initialJson);
  return extractSearchVideos(initialData)
    .filter((video) => video.videoId !== currentId)
    .filter((video) => isRelevantEducationalResult(video, query))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

async function findPopularBenchmark(topic, currentUrl = "") {
  const query = normalizeSearchQuery(topic);
  const currentId = extractVideoId(currentUrl || "");
  const videos = await findPopularCandidatesWithHtml(query, currentId);
  if (!videos.length) throw new Error("Не нашел строго релевантные обучающие ролики по этой предметной теме.");
  const leaders = videos.slice(0, 2);
  const analyses = await Promise.all(leaders.map((video) => analyzeYouTube(video.url, "fast")));
  return {
    topic,
    query,
    searchScope: "YouTube public search fallback, сортировка по просмотрам среди релевантных результатов",
    candidates: videos,
    leaders: leaders.map((leader, index) => ({
      ...analyses[index],
      views: leader.views,
      viewText: leader.viewText || formatViews(leader.views),
      searchTitle: leader.title
    }))
  };
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, requested));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const body = await fs.readFile(filePath);
    res.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const baseHost = req.headers.host || `${host}:${port}`;
    const requestUrl = new URL(req.url || "/", `http://${baseHost}`);
    const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/healthz") {
      json(res, 200, { ok: true, service: "green-a" });
      return;
    }
    if (pathname === "/api/youtube") {
      try {
        const url = requestUrl.searchParams.get("url") || "";
        const mode = requestUrl.searchParams.get("mode") || "stream";
        const payload = await analyzeYouTube(url, mode);
        json(res, 200, payload);
      } catch (error) {
        json(res, 400, { error: error.message });
      }
      return;
    }
    if (pathname === "/api/popular") {
      try {
        const topic = requestUrl.searchParams.get("topic") || "";
        const currentUrl = requestUrl.searchParams.get("currentUrl") || "";
        if (!topic.trim()) throw new Error("Нет темы для поиска.");
        const payload = await findPopularBenchmark(topic, currentUrl);
        json(res, 200, payload);
      } catch (error) {
        json(res, 400, { error: error.message });
      }
      return;
    }
    if (pathname.startsWith("/api/")) {
      json(res, 404, { error: "Неизвестный API endpoint." });
      return;
    }
    let decodedPathname = "";
    try {
      decodedPathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      json(res, 400, { error: "Некорректное кодирование URL пути." });
      return;
    }
    await serveStatic(req, res, decodedPathname);
  } catch (error) {
    console.error("Unhandled request error:", error);
    if (!res.headersSent) json(res, 500, { error: "Внутренняя ошибка сервера." });
    else res.end();
  }
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`Green A running at http://${displayHost}:${port}`);
});
