# Green A

Green A is a Node.js dashboard for rating educational YouTube videos with a Green Argus Index methodology.

The app analyzes a YouTube URL, extracts available metadata/captions/chapters, segments the video, scores it across learning-quality scales, and compares it with topical YouTube benchmarks.

## Local Run

```bash
npm install
npm start
```

Open:

```text
http://127.0.0.1:8787
```

If `npm` is not available locally, the app can be started directly:

```bash
node server.js
```

## Publish To GitHub

From this folder:

```bash
git status
git add .
git commit -m "Prepare Green A for online deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USER_OR_ORG/green-a.git
git push -u origin main
```

If `origin` already exists, replace it:

```bash
git remote set-url origin https://github.com/YOUR_USER_OR_ORG/green-a.git
git push -u origin main
```

## Render Deploy

1. Create a GitHub repository and push this folder.

2. In Render, create a new **Web Service** from the repository.

3. Use these settings:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /healthz
```

4. Add environment variable in Render:

```text
NODE_ENV=production
```

Render automatically provides `PORT`. The server listens on `0.0.0.0`, so it works online.

You can also use the included `render.yaml` as an Infrastructure as Code blueprint.

## GitHub Pages + Online API

GitHub Pages can host only the static frontend. It does **not** run `server.js`, so `/api/youtube` and `/api/popular` will return an HTML page instead of JSON unless a Node backend is deployed separately.

Recommended setup:

1. Deploy this repository as a Render Web Service.
2. Copy the Render URL, for example:

```text
https://green-a.onrender.com
```

3. If your Render URL differs, edit `config.js`:

```js
window.GREEN_A_CONFIG = {
  apiBase: "https://YOUR-RENDER-SERVICE.onrender.com"
};
```

4. Commit and push `config.js`.

When the app is opened from `*.github.io`, it automatically tries `https://green-a.onrender.com` unless `config.js` contains another `apiBase`.

## Environment

`.env.example` documents the runtime variables:

```text
NODE_ENV=production
PORT=8787
HOST=0.0.0.0
```

Optional:

```text
YOUTUBE_API_KEY=...
VIDEO_ANALYSIS_PROVIDER=local|azure|hybrid
AZURE_VIDEO_INDEXER_ACCOUNT_ID=...
AZURE_VIDEO_INDEXER_LOCATION=...
AZURE_VIDEO_INDEXER_ACCESS_TOKEN=...
AZURE_VIDEO_INDEXER_SUBSCRIPTION_KEY=...
VISION_ANALYSIS_PROVIDER=local|qwen|hybrid
QWEN_VL_API_KEY=...
QWEN_VL_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_VL_MODEL=qwen3-vl-plus
```

Do not commit `.env` files with real secrets. The app can work without YouTube API key and without Azure settings, using public YouTube data and local fallback analysis.

## Media Analysis

The backend can run deeper media analysis when the host has the required command-line tools:

- `ffmpeg` for audio loudness, silence, frame brightness/contrast and scene-based segmentation;
- `yt-dlp` for resolving real YouTube audio/video stream URLs when the public page HTML does not expose direct streams;
- `tesseract` with English/Russian language packs for OCR on sampled video frames.
- Optional: Azure AI Video Indexer as OCR provider (`VIDEO_ANALYSIS_PROVIDER=azure`) with automatic fallback to local OCR if Azure is unavailable.
- Hybrid OCR mode (`VIDEO_ANALYSIS_PROVIDER=hybrid`): runs Azure Video Indexer and local `tesseract`, then merges OCR signals for higher recall.
- Optional: Qwen-VL visual understanding (`VISION_ANALYSIS_PROVIDER=qwen|hybrid`) analyzes sampled frames through Alibaba Cloud Model Studio / DashScope and adds slide/code/diagram/demo signals to the visual evidence.

On Render, `packages.txt` asks the platform to install:

```text
ffmpeg
yt-dlp
tesseract-ocr
tesseract-ocr-eng
tesseract-ocr-rus
```

If these tools are missing, the app still works, but the response marks audio/video/OCR analysis as unavailable and falls back to YouTube metadata, captions, chapters and thumbnail signals.

## What It Does

- analyzes YouTube URLs;
- extracts title, description, available captions and chapters;
- segments videos into 30-90 second fragments;
- analyzes audio loudness, pauses and available speech timing through `ffmpeg`;
- analyzes sampled video frames for brightness/contrast and optional OCR through `ffmpeg` + `tesseract`;
- optionally analyzes sampled frames with Qwen-VL for visual teaching signals such as slides, code, charts and whiteboards;
- adds visual observations from screen, scene and OCR signals and uses them as a fallback when captions or speech are missing;
- scores depth, pedagogy, structure, practice, reliability, complexity, technical quality and communication;
- filters out clearly non-educational videos;
- ranks saved videos and groups them by topic;
- compares the current video against popular same-topic benchmarks;
- shows risks, timecodes and evidence for explainability.

## Project Structure

```text
index.html   Static UI
config.js    Frontend backend URL config for GitHub Pages or another static host
styles.css   Dashboard styling
app.js       Client-side scoring and rendering
server.js    Node server, YouTube extraction and benchmark API
render.yaml  Render deployment blueprint
packages.txt Optional system packages for media analysis on Render
```
