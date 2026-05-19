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

Optional YouTube Data API key:

```bash
YOUTUBE_API_KEY=your_key npm start
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
YOUTUBE_API_KEY=your_youtube_data_api_key
```

Render automatically provides `PORT`. The server listens on `0.0.0.0`, so it works online.

You can also use the included `render.yaml` as an Infrastructure as Code blueprint.

## YouTube Data API

With `YOUTUBE_API_KEY`, the service uses:

- `search.list` with `order=viewCount` to find popular topical benchmark videos;
- `videos.list` with `snippet,contentDetails,statistics` to fetch title, description, duration and views;
- fallback scraping only when the key is missing, quota is exhausted, or the API is temporarily unavailable.

Important: YouTube Data API does not return public caption text with a simple API key. Caption text still uses the current page-based fallback, while Data API improves metadata, duration, views, descriptions, chapters and benchmark search.

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
