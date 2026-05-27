# Design: Spec Alignment & Architecture

## Goal
Align Green A MVP with Green Argus spec: fix scale weights, harden red flags, add multi-video support, complete output format.

---

## Part 1: Scale Mapping & Weights

### Current Implementation (app.js:1-8)
```js
const scales = [
  { id: "depth", weight: 24 },
  { id: "pedagogy", weight: 22 },
  { id: "structure", weight: 18 },
  { id: "reliability", weight: 16 },
  { id: "practice", weight: 11 },
  { id: "complexity", weight: 5 },
  { id: "technical", weight: 3 },
  { id: "communication", weight: 1 }
];
```

### Specification (M01–M08)
| Spec | Current | Gap | Plan |
|------|---------|-----|------|
| M01: Structure 15% | structure 18% | +3% | Reduce structure from 18→15 |
| M02: Depth 18% | depth 24% | -6% | Reduce depth from 24→18 |
| M03: Pedagogy 18% | pedagogy 22% | +4% | Reduce pedagogy from 22→18 |
| M04: Practice 14% | practice 11% | -3% | Increase practice from 11→14 |
| M05: Reliability 12% | reliability 16% | +4% | Reduce reliability from 16→12 |
| M06: Complexity 8% | complexity 5% | -3% | Increase complexity from 5→8 |
| M07: Communication 7% | communication 1% | -6% | Increase communication from 1→7 |
| M08: Technical 8% | technical 3% | -5% | Increase technical from 3→8 |

### Action: Task 1 (Fix Weights)
**File**: `app.js:1-8`
**Change**: Update scale weights object to match spec
**Test**: `sum(weights) = 100`, output same for test videos before/after (validates formula is unchanged)

---

## Part 2: Red Flag System

### Current (app.js:1012-1047)
- Flags stored in `flags` object alongside scores
- Used to build `risks` array for display
- **Problem**: Flags influence individual scale scores (e.g., `promiseHits * 0.35`), but don't "lock" max rating when critical

### Spec Requirement
- Red flags stored **separately**, not averaged across videos
- Critical flags (high risk) can **cap max rating**
- Flags carry forward to multi-video aggregation unchanged

### Action: Task 2–3 (Red Flag Overhaul)
1. Create `RedFlagDetector` class or function
   - **Input**: `video` object (title, transcript, ocr, ...)
   - **Output**: `{ flags: [{ level, type, evidence }], criticalFlags: [] }`

2. Implement 6 flag types:
   - `OVERPROMISE` (гарантированно, за неделю, ...)
   - `SALES_OVER_EDUCATION` (купи, скидка, маркетинг)
   - `PSEUDO_EXPERTISE` (без доказательств, апелляция к статусу)
   - `UNVERIFIABLE_CLAIMS` (нет источников, условий)
   - `NO_LIMITATIONS` (универсально без условий)
   - `TECHNICAL_UNFIT` (плохой звук, нечитаемый экран)

3. Flags **do not** directly subtract from scale scores
   - Flags used to **cap** final rating only
   - e.g., OVERPROMISE + critical = max 65

---

## Part 3: Multi-Video Aggregation

### Current
- Single video analysis only
- `analyzeVideo()` returns `{ scores, total, grade, risks }`

### Spec Requirement
- Input: array of videos (e.g., course with 5 lessons)
- Calculation:
  1. Score each video independently
  2. Weight by duration: `weighted_score = Σ(video_score × video_duration) / Σ(durations)`
  3. **Critical**: Red flags NOT averaged
     - If any video has critical flag → carry to course-level report
     - Show which video triggered it

### Action: Task 4 (Add Course Aggregation)
1. New function: `analyzeCourse(videos: array)`
   - Input validation (≥1 video, all have duration)
   - Normalize durations
   - Calculate weighted scores
   - Merge flags (no averaging, preserve source)

2. Output: `{ scores, total, grade, aggregatedRisks, contributingVideos }`

---

## Part 4: Output Format

### Current Card Structure
- Heading: score + grade
- Scale list (8 bars)
- Risk list (high/medium/low)
- Evidence (segments + classification)

### Spec Requirement
Add to output:
1. **Сильные стороны** (2–4 with timecodes)
   - e.g., "Clear structure: 00:15-01:30 defines goal, 01:30-02:45 shows method"
2. **Риски и флаги** (already done)
3. **Для кого подходит** (already done)
4. **Ограничения оценки** (NEW)
   - Дисклеймер: "Results of students, LMS, completion rate not assessed. Only video content evaluated."
   - Note media analysis availability (ffmpeg, tesseract, yt-dlp)

### Action: Task 5 (Complete Output Card)
1. Extract strengths from segments + scores
   - Find top 2–3 segments by type (практика, пример, ясность)
   - Map to timecodes
2. Render **Ограничения** section
   - Static disclaimer text
   - Media analysis status

---

## Part 5: Verification Strategy

### Unit Tests (TDD)
```
tests/
  scale-weights.test.js      → weights sum=100, total calc
  red-flags.test.js          → 6 flag types detected correctly
  aggregation.test.js        → course avg, flags not merged
  output-format.test.js      → all 6 output sections present
```

### Integration Tests
- Load demo videos from app.js
- Verify scores consistent (before/after weights)
- Verify multi-video aggregation math

### Manual Validation
- Compare output vs. spec section by section

---

## Acceptance Criteria

- [ ] All weights updated per spec
- [ ] Red flag system separate from scoring
- [ ] Multi-video aggregation working
- [ ] Output includes all 6 sections
- [ ] All tests GREEN
- [ ] No breaking changes to YouTube API
- [ ] No breaking changes to UI

---

## Timeline (Superpowers TDD)

**Session 1 (this)**: Design approval
**Session 2**: Planning + write tests
**Session 3–4**: Implement tasks 1–5 (subagent-driven)
**Session 5**: Code review + merge

---

**Ready to proceed? Any questions on spec alignment or approach?**
