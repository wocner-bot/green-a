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
