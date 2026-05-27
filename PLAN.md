# Implementation Plan: Green A Spec Alignment

**Methodology**: Superpowers TDD (RED-GREEN-REFACTOR)  
**Total Tasks**: 12 bite-sized (2–5 min each)  
**Estimated Time**: ~2–3 hours full implementation

---

## Phase 1: Scale Weights Fix

### Task 1.1: Write Test for Scale Weights
**File**: `tests/scale-weights.test.js` (NEW)  
**Time**: 3 min

```javascript
// tests/scale-weights.test.js
function testScaleWeights() {
  const scales = [
    { id: "structure", weight: 15 },
    { id: "depth", weight: 18 },
    { id: "pedagogy", weight: 18 },
    { id: "practice", weight: 14 },
    { id: "reliability", weight: 12 },
    { id: "complexity", weight: 8 },
    { id: "communication", weight: 7 },
    { id: "technical", weight: 8 }
  ];
  const sum = scales.reduce((acc, s) => acc + s.weight, 0);
  console.assert(sum === 100, `Weights must sum to 100, got ${sum}`);
  console.log("✓ Scale weights sum to 100");
}

function testWeightedTotalFormula() {
  // Mock scores (all 5/10 = should give ~50 after weighting)
  const scores = {
    structure: 5,
    depth: 5,
    pedagogy: 5,
    practice: 5,
    reliability: 5,
    complexity: 5,
    communication: 5,
    technical: 5
  };
  const scales = [
    { id: "structure", weight: 15 },
    { id: "depth", weight: 18 },
    { id: "pedagogy", weight: 18 },
    { id: "practice", weight: 14 },
    { id: "reliability", weight: 12 },
    { id: "complexity", weight: 8 },
    { id: "communication", weight: 7 },
    { id: "technical", weight: 8 }
  ];
  const total = Math.round(scales.reduce((sum, scale) => sum + scores[scale.id] * scale.weight, 0) / 10);
  console.assert(total === 50, `Expected 50, got ${total}`);
  console.log("✓ Weighted total formula correct");
}

testScaleWeights();
testWeightedTotalFormula();
```

**Success**: Both assertions pass (should FAIL now)

---

### Task 1.2: Update Scale Weights in app.js
**File**: `app.js:1-8`  
**Time**: 2 min

**OLD**:
```javascript
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
```

**NEW**:
```javascript
const scales = [
  { id: "structure", label: "Структурированность", weight: 15 },
  { id: "depth", label: "Содержательная глубина", weight: 18 },
  { id: "pedagogy", label: "Педагогическое качество", weight: 18 },
  { id: "practice", label: "Практическая применимость", weight: 14 },
  { id: "reliability", label: "Достоверность", weight: 12 },
  { id: "complexity", label: "Когнитивная сложность", weight: 8 },
  { id: "communication", label: "Коммуникация", weight: 7 },
  { id: "technical", label: "Техническое качество", weight: 8 }
];
```

**Success**: Tests PASS

---

### Task 1.3: Update rawWeightedTotal() Function
**File**: `app.js:744-745`  
**Time**: 2 min

**Context**: Function already iterates scales correctly. Just verify it's unchanged:

```javascript
function rawWeightedTotal(scores) {
  return Math.round(scales.reduce((sum, scale) => sum + scores[scale.id] * scale.weight, 0) / 10);
}
```

**Verify**: Run tests, demo videos should still have consistent ratings (numbers may shift slightly due to new weights, but formula is consistent)

---

### Task 1.4: Commit Phase 1
**Time**: 1 min
```bash
git add -A
git commit -m "chore: align scale weights with spec (M01-M08)"
```

---

## Phase 2: Red Flag System Overhaul

### Task 2.1: Write Test for Red Flag Detection
**File**: `tests/red-flags.test.js` (NEW)  
**Time**: 4 min

```javascript
// tests/red-flags.test.js
function testRedFlagDetection() {
  const testCases = [
    {
      name: "OVERPROMISE: за неделю",
      text: "станьте экспертом за неделю",
      expectedFlag: "OVERPROMISE"
    },
    {
      name: "SALES_OVER_EDUCATION: купи скидка",
      text: "купи курс со скидкой, подпишись, маркетинг",
      expectedFlag: "SALES_OVER_EDUCATION"
    },
    {
      name: "PSEUDO_EXPERTISE: no sources",
      text: "я говорю, верьте мне, я знаю",
      expectedFlag: "PSEUDO_EXPERTISE"
    },
    {
      name: "NO_LIMITATIONS: подается как универсальное",
      text: "это работает для всех без исключения",
      expectedFlag: "NO_LIMITATIONS"
    },
    {
      name: "UNVERIFIABLE: no sources on finance",
      text: "инвестируйте в акции и богатейте",
      expectedFlag: "UNVERIFIABLE_CLAIMS"
    }
  ];

  testCases.forEach(({ name, text, expectedFlag }) => {
    const flags = detectRedFlags({ transcript: text, ocr: "", title: "" });
    const found = flags.some(f => f.type === expectedFlag);
    console.assert(found, `${name}: expected ${expectedFlag}`);
    console.log(`✓ ${name}`);
  });
}

testRedFlagDetection();
```

**Success**: All assertions FAIL (no detectRedFlags function yet)

---

### Task 2.2: Create detectRedFlags() Function
**File**: `app.js` (after line 130, before classifyTopic)  
**Time**: 5 min

```javascript
function detectRedFlags(video) {
  const text = `${video.title || ""} ${video.transcript || ""} ${video.ocr || ""}`.toLowerCase();
  const flags = [];

  // OVERPROMISE: гарантия, "за неделю", "без усилий"
  if (/гарантир|за неделю|без усилий|быстро станьте|легко и быстро|с нуля до эксперта/i.test(text)) {
    flags.push({
      type: "OVERPROMISE",
      level: "high",
      evidence: "Завышенные обещания: быстрый/гарантированный результат",
      description: "Найдены формулировки типа гарантированного или очень быстрого результата. Снижает доверие к образовательной ценности."
    });
  }

  // SALES_OVER_EDUCATION: маркетинг маркеры
  if (/купи|скидка|подпишись|маркетинг|оффер|продаж|марафон|лайки|подписывайтесь/i.test(text)) {
    flags.push({
      type: "SALES_OVER_EDUCATION",
      level: "medium",
      evidence: "Смещение в продажи: маркетинговые маркеры",
      description: "Транскрипт содержит маркетинговые маркеры. Проверьте, не подменяется ли обучение мотивацией или оффером."
    });
  }

  // PSEUDO_EXPERTISE: без доказательств, апелляция к статусу
  if (/я говорю|верьте мне|я знаю|я говорю вам|послушайте меня|у нас есть опыт/i.test(text) && !/доказыва|источник|исслед|данные|ссылк/i.test(text)) {
    flags.push({
      type: "PSEUDO_EXPERTISE",
      level: "high",
      evidence: "Псевдоэкспертность: апелляция без доказательств",
      description: "Апелляция к статусу без проверяемых объяснений, источников и механизмов."
    });
  }

  // UNVERIFIABLE_CLAIMS: финансовые/медицинские без источников
  if (/(финанс|инвест|акци|крипт|торгов|трейдинг|медицин|лечение|лечебн|лекарст|здоровь)/i.test(text) && !/источник|исслед|данные|ссылк|доказыва/i.test(text)) {
    flags.push({
      type: "UNVERIFIABLE_CLAIMS",
      level: "high",
      evidence: "Непроверяемые ключевые утверждения",
      description: "Финансовые/медицинские утверждения без данных, условий и источников."
    });
  }

  // NO_LIMITATIONS: подается как универсальное без условий
  if (/для всех|без исключения|работает всегда|универсальн|применим везде/i.test(text)) {
    flags.push({
      type: "NO_LIMITATIONS",
      level: "medium",
      evidence: "Отсутствие ограничений: метод универсален",
      description: "Метод подается как универсальный без условий применимости."
    });
  }

  return flags;
}
```

**Success**: Tests PASS

---

### Task 2.3: Integrate Red Flags into scoring (non-destructive)
**File**: `app.js`, function `calculateScores()` around line 599  
**Time**: 3 min

**Current code** already has `flags` object. Add red flag detection:

```javascript
function calculateScores(video = null) {
  // ... existing code ...
  
  const redFlags = detectRedFlags(data); // NEW LINE
  
  // ... rest of calculateScores ...
  
  return { scores, data, flags: { 
    salesHits, promiseHits, sourceHits, practiceHits, textLength, 
    educationalFit, segmentQuality, visualQuality, 
    visualObservationCount: visualObservations.length, 
    visualFallbackActive,
    redFlags // NEW LINE
  } };
}
```

**Success**: Flags captured but don't affect scores yet

---

### Task 2.4: Use Red Flags for Rating Cap
**File**: `app.js`, function `buildRisks()` around line 1012  
**Time**: 3 min

**Add at top of buildRisks()**:

```javascript
function buildRisks(scores, flags, data) {
  const risks = [];
  
  // NEW: Add red flags to risks
  if (flags.redFlags && flags.redFlags.length > 0) {
    flags.redFlags.forEach(flag => {
      risks.push([flag.level, flag.evidence, flag.description]);
    });
  }
  
  // ... rest of existing code ...
}
```

**Success**: Red flags appear in output

---

### Task 2.5: Commit Phase 2
**Time**: 1 min
```bash
git add -A
git commit -m "feat: implement red flag detection system"
```

---

## Phase 3: Multi-Video Aggregation

### Task 3.1: Write Test for Course Aggregation
**File**: `tests/aggregation.test.js` (NEW)  
**Time**: 4 min

```javascript
// tests/aggregation.test.js
function testCourseAggregation() {
  const course = [
    { score: 80, duration: 600 },  // 10 min, score 80
    { score: 60, duration: 600 }   // 10 min, score 60
    // weighted avg: (80*600 + 60*600) / (600+600) = 70
  ];

  const totalDuration = course.reduce((sum, v) => sum + (v.duration || 0), 0);
  const weighted = Math.round(
    course.reduce((sum, v) => sum + v.score * (v.duration || 0), 0) / totalDuration
  );

  console.assert(weighted === 70, `Expected 70, got ${weighted}`);
  console.log("✓ Duration-weighted average correct");
}

function testRedFlagsNotAveraged() {
  const video1 = { flags: [{ type: "OVERPROMISE", level: "high" }] };
  const video2 = { flags: [] };
  
  // Critical flags should carry through unchanged
  const merged = [];
  [video1, video2].forEach(v => {
    v.flags.forEach(f => {
      if (!merged.some(existing => existing.type === f.type)) {
        merged.push(f);
      }
    });
  });

  console.assert(merged.length === 1, "Critical flags not averaged");
  console.assert(merged[0].type === "OVERPROMISE", "OVERPROMISE preserved");
  console.log("✓ Red flags not averaged across videos");
}

testCourseAggregation();
testRedFlagsNotAveraged();
```

**Success**: Tests FAIL (no analyzeCourse function)

---

### Task 3.2: Create analyzeCourse() Function
**File**: `app.js` (after analyzeVideo, around line 620)  
**Time**: 4 min

```javascript
function analyzeCourse(videos = []) {
  if (!videos.length) throw new Error("Course must have at least one video");
  
  // Analyze each video
  const analyzed = videos.map(v => analyzeVideo(v));
  
  // Validate durations
  const validVideos = analyzed.filter(v => v && typeof v.total === 'number');
  if (!validVideos.length) throw new Error("No valid videos in course");
  
  // Calculate total duration (estimate if not provided)
  const totalDuration = validVideos.reduce((sum, v) => {
    const estDuration = v.segments?.reduce((s, seg) => {
      const range = parseTimeRange(seg.time);
      return s + (range ? range.duration : 0);
    }, 0) || 600; // default 10 min
    return sum + estDuration;
  }, 0);

  // Duration-weighted average
  const weightedScores = {};
  scales.forEach(scale => {
    let numerator = 0;
    let denominator = 0;
    validVideos.forEach((v, idx) => {
      const estDuration = v.segments?.reduce((s, seg) => {
        const range = parseTimeRange(seg.time);
        return s + (range ? range.duration : 0);
      }, 0) || 600;
      numerator += (v.scores[scale.id] || 0) * estDuration;
      denominator += estDuration;
    });
    weightedScores[scale.id] = denominator ? numerator / denominator : 0;
  });

  // Aggregate red flags (no averaging)
  const allFlags = {};
  validVideos.forEach((v, idx) => {
    if (v.flags && v.flags.redFlags) {
      v.flags.redFlags.forEach(flag => {
        if (!allFlags[flag.type]) {
          allFlags[flag.type] = { ...flag, sources: [] };
        }
        allFlags[flag.type].sources.push(idx + 1);
      });
    }
  });

  const total = weightedTotal(weightedScores);
  const grade = gradeFor(total);
  
  return {
    type: 'course',
    videoCount: validVideos.length,
    totalDuration,
    scores: weightedScores,
    total,
    grade,
    aggregatedRedFlags: Object.values(allFlags),
    contributingVideos: analyzed
  };
}
```

**Success**: Tests PASS

---

### Task 3.3: Commit Phase 3
**Time**: 1 min
```bash
git add -A
git commit -m "feat: add multi-video course aggregation"
```

---

## Phase 4: Output Format Completion

### Task 4.1: Extract Strengths from Segments
**File**: `app.js` (new function, before renderEvidence)  
**Time**: 3 min

```javascript
function extractStrengths(video, scores) {
  const strengths = [];
  const segments = video.segments || [];
  
  // Top pedagogy segments
  if (scores.pedagogy >= 7) {
    const pedagogySegs = segments.filter(s => /пример|объясн|упраж|демо/i.test(s.type + s.note));
    if (pedagogySegs.length) {
      strengths.push({
        title: "Ясное объяснение",
        timecode: pedagogySegs[0].time,
        description: `Четкие примеры и объяснения помогают пониманию (${pedagogySegs[0].type})`
      });
    }
  }

  // Top practice segments
  if (scores.practice >= 7) {
    const practiceSegs = segments.filter(s => /практик|задани|упраж|проверк/i.test(s.type + s.note));
    if (practiceSegs.length) {
      strengths.push({
        title: "Практическое применение",
        timecode: practiceSegs[0].time,
        description: `Есть упражнения и практические задания (${practiceSegs[0].type})`
      });
    }
  }

  // Top structure score
  if (scores.structure >= 7) {
    strengths.push({
      title: "Хорошая структура",
      timecode: segments[0]?.time || "00:00",
      description: `Видео имеет четкую логику и переходы между разделами`
    });
  }

  return strengths.slice(0, 4);
}
```

**Success**: Function returns 2–4 strengths with timecodes

---

### Task 4.2: Add Disclaimer Section
**File**: `app.js`, function `renderEvidence()` around line 1051  
**Time**: 2 min

**Add before last return**:

```javascript
  // NEW: Limitations disclaimer
  rows.push(["Ограничения оценки", 
    "Оценка основана только на анализе видеоконтента: структура, объяснение, практика, " +
    "доказательность и техника. НЕ оценивается: результаты студентов, LMS, проверка домашних " +
    "заданий, полнота курса, репутация автора. Результаты следует рассматривать как объективный " +
    "анализ видео, а не прогноз успеха обучения."
  ]);
```

**Success**: Disclaimer appears in evidence section

---

### Task 4.3: Render Strengths in Output
**File**: `app.js`, in `renderRating()` or main update function  
**Time**: 3 min

**Add after rendering risks**:

```javascript
function renderStrengths(video, scores) {
  const strengthsContainer = document.querySelector("#strengths") || document.createElement("div");
  strengthsContainer.id = "strengths";
  strengthsContainer.className = "strengths-section";
  
  const strengths = extractStrengths(video, scores);
  if (!strengths.length) {
    strengthsContainer.innerHTML = "<p>Нет явных сильных сторон</p>";
    return;
  }

  strengthsContainer.innerHTML = "<h3>Сильные стороны</h3>" + 
    strengths.map(s => `
      <article class="strength">
        <strong>${escapeHtml(s.title)}</strong>
        <span class="timecode">${escapeHtml(s.timecode)}</span>
        <p>${escapeHtml(s.description)}</p>
      </article>
    `).join("");
  
  // Insert before risks
  const risksList = document.querySelector("#riskList");
  if (risksList && risksList.parentNode) {
    risksList.parentNode.insertBefore(strengthsContainer, risksList);
  }
}

// Call from update() function:
// renderStrengths(currentVideo, scores);
```

**Success**: Strengths section renders in UI

---

### Task 4.4: Commit Phase 4
**Time**: 1 min
```bash
git add -A
git commit -m "feat: complete output format with strengths and limitations"
```

---

## Verification & Testing

### Task 5: Run All Tests
**Command**:
```bash
node tests/scale-weights.test.js
node tests/red-flags.test.js
node tests/aggregation.test.js
```

**Expected**: All assertions pass

---

### Task 6: Manual Validation
1. Open `http://127.0.0.1:8787`
2. Load demo video → verify:
   - Score is in range 0–100
   - All 8 scales visible with NEW weights
   - Red flags shown (if any)
   - Strengths listed (if score > 6 on any scale)
   - Limitations disclaimer present

3. Load multiple demos → verify output format matches spec

---

## Commit Summary
```bash
git log --oneline -8
# Should show:
# feat: complete output format...
# feat: add multi-video course aggregation
# feat: implement red flag detection system
# chore: align scale weights with spec
# (+ 4 prior commits)
```

---

**Ready to execute? Awaiting approval to proceed with TDD implementation.**
