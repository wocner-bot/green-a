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

## Environment

`.env.example` documents the runtime variables:

```text
NODE_ENV=production
PORT=8787
HOST=0.0.0.0
```

Do not commit `.env` files with real secrets. The current app does not require a YouTube API key; it uses public YouTube page data and fallback extraction.

## What It Does

- analyzes YouTube URLs;
- extracts title, description, available captions and chapters;
- segments videos into 30-90 second fragments;
- scores depth, pedagogy, structure, practice, reliability, complexity, technical quality and communication;
- filters out clearly non-educational videos;
- ranks saved videos and groups them by topic;
- compares the current video against popular same-topic benchmarks;
- shows risks, timecodes and evidence for explainability.

## Project Structure

```text
index.html   Static UI
styles.css   Dashboard styling
app.js       Client-side scoring and rendering
server.js    Node server, YouTube extraction and benchmark API
render.yaml  Render deployment blueprint
```
