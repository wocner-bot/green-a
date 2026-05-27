# Green Argus Index — MVP Dashboard

An AI-powered system for automated, objective assessment of educational video quality based on observable teaching indicators, not brand or marketing.

## Quick Start

```bash
npm install
npm start
```

Open: **http://127.0.0.1:8787**

## What Changed (Superpowers Methodology Applied)

✅ **Phase 1–4**: Spec alignment via Superpowers TDD  
- `.instructions.md` — Project instructions & mandatory practices
- `DESIGN.md` — Architecture & spec mapping  
- `PLAN.md` — Implementation plan (12 bite-sized tasks, 2–3 hours total)
- `.claude-plugin` — Superpowers configuration

### Running Implementation

This project now uses **Superpowers TDD workflow**:

1. **RED**: Write failing test
2. **GREEN**: Implement minimal code
3. **REFACTOR**: Clean up + commit
4. **REVIEW**: Check against spec + code quality

### Available Tests
```bash
# Run all tests (after implementation)
node tests/scale-weights.test.js
node tests/red-flags.test.js
node tests/aggregation.test.js
```

## Architecture

### Frontend (`app.js`)
- Topic classification (9 domains)
- 8-scale scoring with spec-aligned weights
- Red flag detection
- Segment editing & validation
- Audience fit analysis
- Risk reporting

### Backend (`server.js`)
- YouTube URL extraction & metadata
- Optional media analysis: `ffmpeg` (audio/video), `yt-dlp` (streams), `tesseract` (OCR)
- Benchmark comparisons by topic
- Public API: `/api/youtube` and `/api/popular`

### UI (`index.html`, `styles.css`)
- Dasha board layout
- Real-time scoring preview
- Segment management
- Output report (scores, risks, audience, evidence)

## Spec Alignment Status

| Component | Status | Notes |
|-----------|--------|-------|
| Scale Weights (M01–M08) | 🟡 In Progress | PLAN Task 1 |
| Red Flags (6 types) | 🟡 In Progress | PLAN Task 2–3 |
| Multi-Video Aggregation | 🟡 In Progress | PLAN Task 3.1–3.2 |
| Output Format (6 sections) | 🟡 In Progress | PLAN Task 4 |
| Tests (TDD) | 🟡 In Progress | PLAN Task 5–6 |

## File Structure
```
/Green A/
  .instructions.md      Superpowers mandatory practices
  .claude-plugin        Plugin config (auto-applies methodology)
  DESIGN.md            Brainstorming & architecture
  PLAN.md              Implementation plan (12 tasks)
  app.js               Frontend scoring (2000+ lines)
  server.js            Backend API (1600+ lines)
  index.html           UI template
  styles.css           Dashboard styling
  config.js            API base config
  package.json         Node 18+, no npm deps
  render.yaml          Render deployment blueprint
  packages.txt         Optional system tools
  spec.md              Reference (Green Argus spec)
  README.md            This file
  tests/
    scale-weights.test.js
    red-flags.test.js
    aggregation.test.js
```

## Next Steps (Superpowers)

### ✅ Completed
- Brainstorming & Design (DESIGN.md)
- Planning (PLAN.md)
- Project setup

### 🚀 Ready to Execute
1. **Write failing tests** (PLAN Phase 1–5, Task 1–6)
2. **Run Subagent-driven development** (parallel task execution)
3. **Two-stage code review** (spec compliance + quality)
4. **Merge & validate** against spec

### 📋 How to Start Implementation

#### Option A: Full Autonomy (Recommended)
```
"Ready to implement PLAN.md Phase 1-4 using Superpowers TDD. 
Start with Task 1.1 (write test), then Task 1.2 (implement), etc. 
Use subagent-driven-development for parallel tasks."
```

#### Option B: Guided Steps
1. Request `tests/scale-weights.test.js` creation
2. Request weight update in `app.js:1-8`
3. Continue task by task with manual review

#### Option C: Review Then Decide
- Read `.instructions.md` for mandatory practices
- Review `DESIGN.md` for spec alignment details
- Check `PLAN.md` for full task breakdown

## Technologies

- **Runtime**: Node.js 18+
- **Frontend**: Vanilla JS (no frameworks)
- **Optional Media Tools**: `ffmpeg`, `yt-dlp`, `tesseract` (installed on Render via `packages.txt`)
- **Deployment**: Render (Web Service)

## Environment

```
NODE_ENV=production  # or development
PORT=8787            # default
HOST=0.0.0.0         # listen on all interfaces
```

Create `.env` locally if needed (don't commit secrets).

## Deployment (Render)

1. Push to GitHub
2. Create Render Web Service from repo
3. Use `render.yaml` or manual config:
   ```
   Runtime: Node
   Build: npm install
   Start: npm start
   Health Check: /healthz
   ```

## Media Analysis

The app works with or without optional tools. If missing, analysis is skipped gracefully:

- **No `ffmpeg`**: Audio/video metrics unavailable
- **No `yt-dlp`**: Stream extraction skipped (uses page HTML fallback)
- **No `tesseract`**: OCR text recognition unavailable

See `packages.txt` for Render auto-install setup.

## Demo Data

Built-in demo videos showcase:
- Educational lecture (strong)
- Motivational pitch (weak)
- SQL practical (strong)
- UX history (mixed)

Load demo: Button in dashboard UI.

## Philosophy

🎯 **Test-Driven Development** — Write tests first, always  
🔍 **Systematic over Ad-Hoc** — Process over guessing  
⚡ **Simplicity** — Minimal code, maximum clarity  
✅ **Verify Before Ship** — No speculation, only evidence

---

**Built with Superpowers methodology. See `.instructions.md` and `DESIGN.md` for details.**
