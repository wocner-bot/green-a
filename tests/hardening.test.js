const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const vm = require('node:vm');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request({ port, path: reqPath }) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: reqPath, method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function startServer(port) {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let boot = '';
  const onStdout = (chunk) => {
    boot += chunk.toString();
  };
  child.stdout.on('data', onStdout);

  for (let i = 0; i < 30; i += 1) {
    if (child.exitCode !== null) break;
    if (boot.includes('Green A running at')) {
      child.stdout.off('data', onStdout);
      return child;
    }
    await wait(100);
  }

  child.stdout.off('data', onStdout);
  throw new Error(`Server did not start correctly. exitCode=${child.exitCode}; logs=${boot}`);
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await wait(200);
  if (child.exitCode === null) child.kill('SIGKILL');
}

function extractFunctionSource(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Function not found: ${name}`);

  const paramsStart = source.indexOf("(", start);
  if (paramsStart < 0) throw new Error(`No params for function: ${name}`);

  let paramsDepth = 0;
  let paramsEnd = -1;
  for (let i = paramsStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "(") paramsDepth += 1;
    if (ch === ")") {
      paramsDepth -= 1;
      if (paramsDepth === 0) {
        paramsEnd = i;
        break;
      }
    }
  }
  if (paramsEnd < 0) throw new Error(`Unbalanced params for function: ${name}`);

  const openBrace = source.indexOf("{", paramsEnd);
  if (openBrace < 0) throw new Error(`No body for function: ${name}`);

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = openBrace; i < source.length; i += 1) {
    const ch = source[i];

    if (inSingle || inDouble || inTemplate) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (inSingle && ch === "'") inSingle = false;
      else if (inDouble && ch === '"') inDouble = false;
      else if (inTemplate && ch === '`') inTemplate = false;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error(`Unbalanced braces for function: ${name}`);
}

test('Server survives malformed URI path and still responds', async () => {
  const port = 19000 + Math.floor(Math.random() * 500);
  const child = await startServer(port);

  try {
    let malformedError = null;
    try {
      await request({ port, path: '/%E0%A4%A' });
    } catch (error) {
      malformedError = error;
    }

    await wait(300);

    assert.equal(child.exitCode, null, 'Server process must stay alive after malformed URI');

    const health = await request({ port, path: '/healthz' });
    assert.equal(health.statusCode, 200);

    if (malformedError) {
      assert.match(malformedError.message, /400|Bad Request|socket hang up|ECONNRESET/i);
    }
  } finally {
    await stopServer(child);
  }
});

test('No hardcoded YouTube API key in server source', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'server.js'), 'utf8');
  assert.equal(/AIza[0-9A-Za-z_-]{10,}/.test(source), false, 'Server source must not embed raw API keys');
});

test('Qwen-VL result normalization keeps visual teaching signals structured', () => {
  const serverSource = fs.readFileSync(path.resolve(__dirname, '..', 'server.js'), 'utf8');
  const snippet = [
    extractFunctionSource(serverSource, 'clamp'),
    extractFunctionSource(serverSource, 'cleanSegmentText'),
    extractFunctionSource(serverSource, 'uniqueWarnings'),
    extractFunctionSource(serverSource, 'cleanStringArray'),
    extractFunctionSource(serverSource, 'normalizeQwenVlResult'),
    'module.exports = { normalizeQwenVlResult };'
  ].join('\n\n');

  const sandbox = { module: { exports: {} }, exports: {} };
  vm.createContext(sandbox);
  vm.runInContext(snippet, sandbox);

  const { normalizeQwenVlResult } = sandbox.module.exports;
  const result = normalizeQwenVlResult({
    has_visual_teaching: true,
    screen_type: 'slides',
    visible_text: ['Step 1: Revenue formula', 'Example dashboard'],
    educational_visual_signals: ['charts', 'step_by_step', 'charts'],
    entertainment_visual_signals: ['vlog'],
    visual_learning_score: 8.8,
    confidence: 0.82,
    summary: 'Frames show slides with structured examples.'
  }, { model: 'qwen3-vl-plus', framesAnalyzed: 8 });

  assert.equal(result.available, true);
  assert.equal(result.provider, 'qwen-vl');
  assert.equal(result.model, 'qwen3-vl-plus');
  assert.equal(result.framesAnalyzed, 8);
  assert.equal(result.screenType, 'slides');
  assert.equal(result.visualLearningScore, 8.8);
  assert.equal(result.confidence, 0.82);
  assert.equal(JSON.stringify(result.visibleText), JSON.stringify(['Step 1: Revenue formula', 'Example dashboard']));
  assert.equal(JSON.stringify(result.educationalSignals), JSON.stringify(['charts', 'step_by_step']));
  assert.equal(JSON.stringify(result.negativeSignals), JSON.stringify(['vlog']));
  assert.equal(result.summary, 'Frames show slides with structured examples.');
  assert.equal(JSON.stringify(result.warnings), JSON.stringify([]));
});

test('Qwen-VL visual understanding merges into OCR fallback text without losing local OCR', () => {
  const serverSource = fs.readFileSync(path.resolve(__dirname, '..', 'server.js'), 'utf8');
  const snippet = [
    extractFunctionSource(serverSource, 'cleanSegmentText'),
    extractFunctionSource(serverSource, 'uniqueWarnings'),
    extractFunctionSource(serverSource, 'qwenVisualSummaryText'),
    extractFunctionSource(serverSource, 'mergeVisualUnderstandingIntoOcr'),
    'module.exports = { mergeVisualUnderstandingIntoOcr };'
  ].join('\n\n');

  const sandbox = { module: { exports: {} }, exports: {} };
  vm.createContext(sandbox);
  vm.runInContext(snippet, sandbox);

  const { mergeVisualUnderstandingIntoOcr } = sandbox.module.exports;
  const ocr = mergeVisualUnderstandingIntoOcr(
    {
      available: true,
      frames: [{ time: '00:20', text: 'Local OCR text', hasText: true, source: 'local-tesseract' }],
      text: 'Local OCR text',
      warnings: [],
      source: 'local-tesseract'
    },
    {
      available: true,
      provider: 'qwen-vl',
      model: 'qwen3-vl-plus',
      framesAnalyzed: 4,
      screenType: 'code',
      visualLearningScore: 9,
      visibleText: ['function calculateScore()'],
      educationalSignals: ['code', 'step_by_step'],
      negativeSignals: [],
      summary: 'Frames show code walkthrough.',
      warnings: []
    }
  );

  assert.equal(ocr.available, true);
  assert.equal(ocr.source, 'hybrid-qwen-local');
  assert.match(ocr.text, /Local OCR text/);
  assert.match(ocr.text, /Qwen-VL визуальный анализ/);
  assert.match(ocr.text, /function calculateScore/);
  assert.equal(ocr.frames.length, 2);
  assert.equal(ocr.frames[1].source, 'qwen-vl');
});

test('Educational fit logic in app.js matches lib implementation', () => {
  const appSource = fs.readFileSync(path.resolve(__dirname, '..', 'app.js'), 'utf8');
  const { assessEducationalFit: assessFromLib } = require('../lib/educationalFit.js');

  const snippet = [
    extractFunctionSource(appSource, 'countHits'),
    extractFunctionSource(appSource, 'regexHits'),
    extractFunctionSource(appSource, 'assessEducationalFit'),
    'module.exports = { assessEducationalFit };'
  ].join('\n\n');

  const sandbox = { module: { exports: {} }, exports: {} };
  vm.createContext(sandbox);
  vm.runInContext(snippet, sandbox);

  const assessFromApp = sandbox.module.exports.assessEducationalFit;

  const fixtures = [
    {
      data: { title: 'Мой влог: прогулка', topic: '', transcript: 'приятного просмотра, лайки', ocr: '' },
      segments: [],
      signals: {}
    },
    {
      data: { title: 'Урок SQL: практическое задание', topic: 'SQL', transcript: 'цель урока: join. задание: проверьте результат', ocr: '' },
      segments: [
        { time: '00:00-00:45', type: 'теория', note: 'объяснение', source: 'captions' },
        { time: '00:45-01:30', type: 'практика', note: 'решение задачи', source: 'captions' },
        { time: '01:30-02:15', type: 'практика', note: 'проверка результата', source: 'captions' }
      ],
      signals: { visualObservationCount: 0 }
    }
  ];

  for (const fixture of fixtures) {
    const normalized = {
      ...fixture.data,
      combined: `${fixture.data.title || ''}\n${fixture.data.topic || ''}\n${fixture.data.transcript || ''}\n${fixture.data.ocr || ''}`
    };

    const appResult = assessFromApp(normalized, fixture.segments, fixture.signals);
    const libResult = assessFromLib(fixture.data, fixture.segments, fixture.signals);

    const appSummary = {
      eligible: appResult.eligible,
      weak: appResult.weak,
      exclude: appResult.exclude,
      score: appResult.score,
      reasons: appResult.reasons,
      markers: appResult.markers
    };
    const libSummary = {
      eligible: libResult.eligible,
      weak: libResult.weak,
      exclude: libResult.exclude,
      score: libResult.score,
      reasons: libResult.reasons,
      markers: libResult.markers
    };
    assert.equal(JSON.stringify(appSummary), JSON.stringify(libSummary));
  }
});

test('calculateScores keeps totals finite when manual tech metrics are missing', () => {
  const appSource = fs.readFileSync(path.resolve(__dirname, '..', 'app.js'), 'utf8');
  const constBlock = appSource.slice(0, appSource.indexOf('const els ='));

  const snippet = [
    constBlock,
    extractFunctionSource(appSource, 'clamp'),
    extractFunctionSource(appSource, 'finiteScore'),
    extractFunctionSource(appSource, 'resolveVideoMetric'),
    extractFunctionSource(appSource, 'countHits'),
    extractFunctionSource(appSource, 'regexHits'),
    extractFunctionSource(appSource, 'uniqueTypes'),
    extractFunctionSource(appSource, 'visualObservationLines'),
    extractFunctionSource(appSource, 'calculateScores'),
    extractFunctionSource(appSource, 'assessEducationalFit'),
    extractFunctionSource(appSource, 'weightedTotal'),
    extractFunctionSource(appSource, 'rawWeightedTotal'),
    extractFunctionSource(appSource, 'majorQualityProfile'),
    extractFunctionSource(appSource, 'majorQualityCap'),
    extractFunctionSource(appSource, 'educationalFitCap'),
    extractFunctionSource(appSource, 'nonEducationalPenaltyTotal'),
    'module.exports = { calculateScores, weightedTotal, nonEducationalPenaltyTotal };'
  ].join('\n\n');

  const sandbox = {
    module: { exports: {} },
    exports: {},
    crypto: { randomUUID: () => 'test-id' },
    state: { segments: [], visualObservations: [] }
  };
  vm.createContext(sandbox);
  vm.runInContext(snippet, sandbox);

  const { calculateScores, weightedTotal, nonEducationalPenaltyTotal } = sandbox.module.exports;
  const video = {
    title: 'Урок SQL: JOIN пошагово',
    topic: 'Базы данных',
    description: 'Цель урока: научиться выбирать JOIN под задачу. Пошаговый разбор, пример и практическое задание.',
    transcript: 'Сначала сформулируем цель урока. Затем разберем пример и дадим практическое задание с проверкой результата.',
    ocr: 'INNER JOIN, LEFT JOIN, проверка результата',
    segments: [
      { time: '00:00-00:40', type: 'теория', note: 'цель урока' },
      { time: '00:40-01:20', type: 'пример', note: 'разбор запроса' },
      { time: '01:20-02:10', type: 'практика', note: 'задание и проверка' }
    ],
    mediaAnalysis: {
      audio: { score: 7.4, speechScore: 7.8 },
      video: { score: 7.2, readabilityScore: 8.1 }
    }
  };

  const { scores, flags } = calculateScores(video);
  const weighted = weightedTotal(scores);
  const total = flags.educationalFit.exclude ? nonEducationalPenaltyTotal(flags.educationalFit, weighted) : weighted;

  assert.equal(Number.isFinite(scores.technical), true, 'technical score should stay finite without manual sliders');
  assert.equal(Number.isFinite(scores.communication), true, 'communication score should stay finite without manual sliders');
  assert.equal(Number.isFinite(weighted), true, 'weighted total should stay finite without manual sliders');
  assert.equal(Number.isFinite(total), true, 'final total should stay finite without manual sliders');
});

test('Structured school theory lesson scores above entertainment-style promo', () => {
  const appSource = fs.readFileSync(path.resolve(__dirname, '..', 'app.js'), 'utf8');
  const constBlock = appSource.slice(0, appSource.indexOf('const els ='));

  const snippet = [
    constBlock,
    extractFunctionSource(appSource, 'clamp'),
    extractFunctionSource(appSource, 'finiteScore'),
    extractFunctionSource(appSource, 'resolveVideoMetric'),
    extractFunctionSource(appSource, 'countHits'),
    extractFunctionSource(appSource, 'regexHits'),
    extractFunctionSource(appSource, 'uniqueTypes'),
    extractFunctionSource(appSource, 'visualObservationLines'),
    extractFunctionSource(appSource, 'calculateScores'),
    extractFunctionSource(appSource, 'analyzeVideo'),
    extractFunctionSource(appSource, 'assessEducationalFit'),
    extractFunctionSource(appSource, 'weightedTotal'),
    extractFunctionSource(appSource, 'rawWeightedTotal'),
    extractFunctionSource(appSource, 'majorQualityProfile'),
    extractFunctionSource(appSource, 'majorQualityCap'),
    extractFunctionSource(appSource, 'educationalFitCap'),
    extractFunctionSource(appSource, 'nonEducationalPenaltyTotal'),
    extractFunctionSource(appSource, 'gradeFor'),
    extractFunctionSource(appSource, 'buildRisks'),
    'module.exports = { analyzeVideo };'
  ].join('\n\n');

  const sandbox = {
    module: { exports: {} },
    exports: {},
    crypto: { randomUUID: () => 'test-id' },
    state: { segments: [], visualObservations: [] }
  };
  vm.createContext(sandbox);
  vm.runInContext(snippet, sandbox);

  const { analyzeVideo } = sandbox.module.exports;

  const theoryLesson = {
    title: 'Действительные числа. Теория. Видеоурок 1. Алгебра 10 класс',
    topic: 'Математика',
    description: 'Тема сегодняшнего урока – действительные числа. На этом уроке мы узнаем, какие числа называются натуральными, целыми, рациональными, иррациональными и действительными.\n\n0:00 Вступление\n0:17 Натуральные числа\n0:53 Целые числа\n1:30 Рациональные числа\n4:25 Периодическая дробь\n5:50 Иррациональные числа\n7:46 Действительные числа\n8:48 Операции над действительными числами\n9:44 Модуль действительного числа',
    transcript: 'Привет, меня зовут Елена, и я преподаватель математики. Сегодня наша тема — действительные числа. Сейчас познакомимся с натуральными числами, целыми числами, рациональными числами, периодическими дробями, иррациональными числами и множеством действительных чисел. Разберем определения, примеры и обозначения.',
    ocr: '',
    segments: [
      { time: '00:00-00:17', type: 'теория', note: 'Вступление', source: 'description', topic: 'Вступление', score: 2.1, evidence: 'смысловой фрагмент без явных учебных маркеров' },
      { time: '00:17-00:53', type: 'теория', note: 'Натуральные числа', source: 'description', topic: 'Натуральные числа', score: 2.1, evidence: 'смысловой фрагмент без явных учебных маркеров' },
      { time: '00:53-01:30', type: 'теория', note: 'Целые числа', source: 'description', topic: 'Целые числа', score: 2.1, evidence: 'смысловой фрагмент без явных учебных маркеров' },
      { time: '01:30-04:25', type: 'теория', note: 'Рациональные числа', source: 'description', topic: 'Рациональные числа', score: 2.1, evidence: 'смысловой фрагмент без явных учебных маркеров' },
      { time: '04:25-05:50', type: 'теория', note: 'Периодическая дробь', source: 'description', topic: 'Периодическая дробь', score: 3.7, evidence: 'понятия/метод' },
      { time: '05:50-07:46', type: 'теория', note: 'Иррациональные числа', source: 'description', topic: 'Иррациональные числа', score: 2.1, evidence: 'смысловой фрагмент без явных учебных маркеров' },
      { time: '07:46-09:44', type: 'теория', note: 'Действительные числа', source: 'description', topic: 'Действительные числа', score: 2.1, evidence: 'смысловой фрагмент без явных учебных маркеров' }
    ],
    visualObservations: [],
    mediaAnalysis: {
      audio: { available: false, score: 8, warnings: ['Медиа-анализ отключен в быстром режиме.'] },
      video: { available: false, score: 5, readabilityScore: 5, warnings: ['Медиа-анализ отключен в быстром режиме.'] }
    }
  };

  const entertainmentPromo = {
    title: 'Стань AI-экспертом за неделю: мотивационный интенсив',
    topic: 'AI и машинное обучение',
    transcript: 'Сегодня я покажу легкий и быстрый путь с нуля до эксперта за неделю. Подпишись, купи курс со скидкой и повторяй мои шаги. Мы не будем углубляться в термины, главное поверить в себя и действовать без усилий.',
    ocr: 'AI за 7 дней. Скидка. Быстрый результат. Мотивация.',
    audio: 6,
    video: 7,
    slides: 4,
    pace: 6,
    segments: [
      { time: '00:00-00:44', type: 'мотивация', note: 'Обещает быстрый результат без проверки' },
      { time: '00:44-01:20', type: 'продажа', note: 'Смещение в оффер и подписку' }
    ],
    visualObservations: [],
    mediaAnalysis: null
  };

  const theoryAnalysis = analyzeVideo(theoryLesson);
  const promoAnalysis = analyzeVideo(entertainmentPromo);

  assert.equal(theoryAnalysis.educationalFit.classification, 'educational');
  assert(theoryAnalysis.total >= 55, `Structured school theory lesson should stay above low-score territory, got ${theoryAnalysis.total}`);
  assert(theoryAnalysis.total - promoAnalysis.total >= 10, `Educational theory lesson should clearly outrank entertainment-style promo, got ${theoryAnalysis.total} vs ${promoAnalysis.total}`);
});
