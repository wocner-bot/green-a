const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { URL } = require("node:url");

const root = __dirname;
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const youtubeApiKey = process.env.YOUTUBE_API_KEY || "";

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
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0];
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const shorts = url.pathname.match(/\/shorts\/([^/?]+)/);
    if (shorts) return shorts[1];
    const embed = url.pathname.match(/\/embed\/([^/?]+)/);
    if (embed) return embed[1];
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  }
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

function parseIsoDuration(value) {
  const match = String(value || "").match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match.map((part) => Number(part || 0));
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function youtubeApiUrl(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries({ ...params, key: youtubeApiKey }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function fetchYouTubeApi(endpoint, params) {
  if (!youtubeApiKey) throw new Error("YOUTUBE_API_KEY не задан.");
  return fetchJson(youtubeApiUrl(endpoint, params));
}

function normalizeApiVideo(item) {
  const snippet = item.snippet || {};
  const stats = item.statistics || {};
  const details = item.contentDetails || {};
  const videoId = typeof item.id === "string" ? item.id : item.id?.videoId;
  return {
    videoId,
    title: snippet.title || "Без названия",
    description: snippet.description || "",
    channelTitle: snippet.channelTitle || "",
    publishedAt: snippet.publishedAt || "",
    views: Number(stats.viewCount || 0),
    viewText: stats.viewCount ? `${formatViews(Number(stats.viewCount))} просмотров` : "",
    duration: parseIsoDuration(details.duration),
    caption: details.caption || "",
    thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
    url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : ""
  };
}

async function fetchVideoDetailsFromApi(videoId) {
  const data = await fetchYouTubeApi("videos", {
    part: "snippet,contentDetails,statistics",
    id: videoId
  });
  const item = data.items?.[0];
  return item ? normalizeApiVideo(item) : null;
}

async function fetchVideosDetailsFromApi(videoIds) {
  const ids = [...new Set(videoIds.filter(Boolean))].slice(0, 50);
  if (!ids.length) return [];
  const data = await fetchYouTubeApi("videos", {
    part: "snippet,contentDetails,statistics",
    id: ids.join(",")
  });
  return (data.items || []).map(normalizeApiVideo).filter((video) => video.videoId);
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
  if (/нейро|нейросет|ai|machine learning|искусственн|модель/.test(value)) return "ai";
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
      required: /нейро|нейросет|ai|machine learning|искусственн|модель|chatgpt|llm/,
      forbidden: /англий|english|иностранн.*язык|трейдинг|trading|ux|figma|физик|математ/
    }
  };
  const rule = rules[domain];
  if (!rule) return true;
  return rule.required.test(value) && !rule.forbidden.test(value);
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

async function detectSceneSegments(streamUrl, duration) {
  if (!streamUrl || !duration) return [];
  const analysisLimit = Math.min(Number(duration), 1800);
  const args = [
    "-hide_banner",
    "-nostdin",
    "-t", String(analysisLimit),
    "-i", streamUrl,
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

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "accept-language": "ru,en;q=0.8",
      "user-agent": "Mozilla/5.0 GreenA/1.0"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "accept-language": "ru,en;q=0.8",
      "user-agent": "Mozilla/5.0 GreenA/1.0"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  if (!text.trim()) throw new Error("Пустой JSON-ответ");
  return JSON.parse(text);
}

async function getOEmbed(videoUrl) {
  try {
    return await fetchJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(videoUrl)}`);
  } catch {
    return {};
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
    cues = (data.events || [])
      .filter((event) => Array.isArray(event.segs))
      .map((event) => ({
        start: Number(event.tStartMs || 0) / 1000,
        duration: Number(event.dDurationMs || 0) / 1000,
        text: decodeEntities(event.segs.map((seg) => seg.utf8 || "").join("").replace(/\s+/g, " ").trim())
      }))
      .filter((cue) => cue.text);
  } catch {
    const xml = await fetchText(track.baseUrl);
    cues = [...xml.matchAll(/<text start="([^"]+)"(?: dur="([^"]+)")?[^>]*>([\s\S]*?)<\/text>/g)]
      .map((match) => ({
        start: Number(match[1] || 0),
        duration: Number(match[2] || 0),
        text: decodeEntities(match[3].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      }))
      .filter((cue) => cue.text);
  }
  return {
    transcript: cues.map((cue) => cue.text).join(" ").replace(/\s+/g, " ").trim(),
    cues
  };
}

async function fetchBestCaptions(tracks) {
  for (const track of orderCaptionTracks(tracks)) {
    try {
      const result = await fetchCaptions(track);
      if (result.transcript) return { ...result, track };
    } catch {
      // Try the next manual or automatic caption track.
    }
  }
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
  if (!videoId) throw new Error("Не смог распознать YouTube ID.");
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const [html, oembed, apiVideo] = await Promise.all([
    fetchText(videoUrl),
    getOEmbed(videoUrl),
    fetchVideoDetailsFromApi(videoId).catch(() => null)
  ]);
  const playerJson = extractBalancedJson(html, "ytInitialPlayerResponse");
  let player = {};
  try {
    player = playerJson ? JSON.parse(playerJson) : {};
  } catch {
    player = {};
  }
  const details = player.videoDetails || {};
  const micro = player.microformat?.playerMicroformatRenderer || {};
  const title = apiVideo?.title || details.title || micro.title?.simpleText || oembed.title || "Без названия";
  const description = apiVideo?.description || details.shortDescription || flattenText(micro.description) || "";
  const videoDuration = Number(apiVideo?.duration || details.lengthSeconds || micro.lengthSeconds || 0);
  const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  const streamUrl = chooseStreamUrl(player.streamingData || {});
  const [{ transcript, cues, track }, thumbnail] = await Promise.all([
    fetchBestCaptions(tracks),
    mode === "stream" ? probeThumbnail(videoId) : Promise.resolve(null)
  ]);
  const chapters = parseDescriptionChapters(description, videoDuration);
  const chapterSegments = buildChapterSegments(chapters);
  let mediaSegments = [];
  if (!chapterSegments.length && !cues.length && mode === "stream") {
    try {
      mediaSegments = await detectSceneSegments(streamUrl, videoDuration);
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
  const signals = [
    apiVideo ? "метаданные, описание, длительность и просмотры получены через YouTube Data API" : "",
    "название и описание страницы YouTube",
    chapterSegments.length ? "главы и тематические таймкоды найдены в описании" : "",
    transcript && track?.sourceType === "manual" ? "ручные субтитры с таймкодами" : "",
    transcript && track?.sourceType === "automatic" ? "автоматические субтитры YouTube с таймкодами" : "",
    !transcript ? "ручные и автоматические субтитры не найдены" : "",
    mediaSegments.length ? "сегменты построены по видеопотоку без сохранения файла" : "",
    mode === "stream" && thumbnail ? "thumbnail проверен без сохранения файла" : "",
    cues.length ? "темп речи оценен по таймингам субтитров" : ""
  ].filter(Boolean);
  const limitations = [
    "OCR кадров не выполняется без доступа к видеоряду",
    "качество звука оценено предварительно, без анализа аудиопотока",
    "качество видео оценено предварительно по доступным косвенным сигналам",
    "комментарии YouTube не подключены; тематические таймкоды берутся из описания",
    apiVideo ? "YouTube Data API не отдает публичный текст субтитров по API-ключу; субтитры извлекаются отдельным fallback-механизмом со страницы" : "YOUTUBE_API_KEY не задан или API недоступен; метаданные взяты fallback-механизмом"
  ];
  return {
    url: videoUrl,
    title,
    topicSeed: combinedForTopic,
    description,
    transcript,
    ocr: [description, chapterText ? `\nГлавы из описания:\n${chapterText}` : ""].filter(Boolean).join("\n"),
    audio: transcript ? 7 : 5,
    video: visual.video,
    slides: visual.slides,
    pace: estimatePace(cues),
    segments: chapterSegments.length ? chapterSegments : (cues.length ? buildSegments(cues) : mediaSegments),
    source: {
      videoId,
      mode,
      author: apiVideo?.channelTitle || oembed.author_name || details.author || "",
      apiEnabled: Boolean(apiVideo),
      views: apiVideo?.views || 0,
      viewText: apiVideo?.viewText || "",
      publishedAt: apiVideo?.publishedAt || "",
      apiCaptionFlag: apiVideo?.caption || "",
      thumbnail,
      captionLanguage: track?.languageCode || "",
      captionType: track?.sourceType || "",
      captionName: trackName(track),
      chaptersFound: chapters.length,
      chapterSegments: chapterSegments.length,
      mediaSegments: mediaSegments.length,
      transcriptAvailable: Boolean(transcript),
      signals,
      limitations,
      note: transcript
        ? `Название, описание, ${track?.sourceType === "automatic" ? "автоматические" : "ручные"} субтитры и сегменты получены без сохранения видеофайла.`
        : "Название и описание получены автоматически, но ручные и автоматические субтитры не найдены."
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

async function findPopularCandidatesWithApi(query, currentId) {
  const search = await fetchYouTubeApi("search", {
    part: "snippet",
    q: query,
    type: "video",
    order: "viewCount",
    maxResults: 25,
    safeSearch: "none",
    videoEmbeddable: "any"
  });
  const ids = (search.items || [])
    .map((item) => item.id?.videoId)
    .filter((id) => id && id !== currentId);
  const detailed = await fetchVideosDetailsFromApi(ids);
  const order = new Map(ids.map((id, index) => [id, index]));
  return detailed
    .filter((video) => video.videoId !== currentId)
    .filter((video) => isRelevantEducationalResult(video, query))
    .sort((a, b) => {
      const byViews = b.views - a.views;
      return byViews || ((order.get(a.videoId) || 0) - (order.get(b.videoId) || 0));
    })
    .slice(0, 8);
}

async function findPopularCandidatesFromHtml(query, currentId) {
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
  let searchSource = "html";
  let videos = [];
  if (youtubeApiKey) {
    try {
      videos = await findPopularCandidatesWithApi(query, currentId);
      searchSource = "youtube-data-api";
    } catch {
      videos = [];
    }
  }
  if (!videos.length) {
    videos = await findPopularCandidatesFromHtml(query, currentId);
    searchSource = "html-fallback";
  }
  if (!videos.length) throw new Error("Не нашел строго релевантные обучающие ролики по этой предметной теме.");
  const leaders = videos.slice(0, 2);
  const analyses = await Promise.all(leaders.map((video) => analyzeYouTube(video.url, "fast")));
  return {
    topic,
    query,
    searchSource,
    apiEnabled: searchSource === "youtube-data-api",
    searchScope: searchSource === "youtube-data-api"
      ? "YouTube Data API: search.list order=viewCount + videos.list statistics/contentDetails, затем строгий фильтр предмета и учебного формата"
      : "YouTube public search fallback, сортировка по просмотрам среди релевантных результатов",
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
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  if (requestUrl.pathname === "/healthz") {
    json(res, 200, { ok: true, service: "green-a" });
    return;
  }
  if (requestUrl.pathname === "/api/youtube") {
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
  if (requestUrl.pathname === "/api/popular") {
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
  await serveStatic(req, res, decodeURIComponent(requestUrl.pathname));
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`Green A running at http://${displayHost}:${port}`);
});
