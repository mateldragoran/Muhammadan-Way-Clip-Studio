# Muhammadan Way Clip Studio 🎬🕌

An open-source, AI-powered video editing platform designed specifically for Shaykh Nurjan Q and Mureeds. It transforms long-form suhbhas (lectures) and nasheeds into highly engaging, viral short-form content (TikTok, Reels, Shorts) in seconds.

## ✨ Features

- **AI Highlight Finder:** Powered by Groq/Llama3, automatically scans transcripts and finds the most viral 30-60 second hooks.
- **Multilingual Subtitles Engine:** Instantly switch burned-in subtitles between English, Urdu, Arabic, Turkish, Spanish, Persian, and Hindi.
- **B-Roll & Music Overlays:** Easily lay cinematic B-roll (split-screen or full) and background nasheeds over your videos.
- **Cloud FFmpeg Rendering:** A custom Node.js backend handles heavy video rendering in the cloud—no powerful PC required.
- **Viral Social Copywriter:** Generates optimized TikTok/Reels captions and hashtags based on the video's transcript.

## 🏗 Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Zustand, Framer Motion.
- **Backend:** Node.js, Express, `fluent-ffmpeg`.
- **Database & Auth:** Supabase (PostgreSQL, Storage, Auth).
- **AI & Transcription:** Deepgram (Audio-to-text) & Groq (Llama-3 text analysis).

---

## 🚀 Deployment Guide

This repository contains both the `frontend` and `backend` in a monorepo structure. You will deploy them separately.

### Prerequisites
1. A [Supabase](https://supabase.com/) account.
2. A [Groq](https://groq.com/) API Key.
3. A [Deepgram](https://deepgram.com/) API Key.

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Go to the **SQL Editor** and paste the contents of `supabase_schema.sql` to generate your tables and security policies.
3. Go to **Storage** and create two **Public** buckets: `source-videos` and `rendered-clips`.

### 2. Deploying the Backend (Railway / AWS / VPS)
The backend requires FFmpeg to be installed on the operating system, so it must be deployed using the provided Dockerfile. [Railway](https://railway.app/) is highly recommended.

1. Create a new project on Railway and select "Deploy from GitHub repo".
2. Select this repository.
3. **CRITICAL:** Set the Root Directory to `/backend` in your Railway settings.
4. Add the following Environment Variables:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   DEEPGRAM_API_KEY=your_deepgram_key
   GROQ_API_KEY=your_groq_key
   ```
5. Deploy! Railway will automatically build the Dockerfile and install FFmpeg.

### 3. Deploying the Frontend (Vercel / Netlify)
1. Import this repository into Vercel or Netlify.
2. Set the Root Directory to `/frontend`.
3. Add the following Environment Variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=your_deployed_backend_url (e.g., https://your-backend.up.railway.app/api)
   ```
4. Deploy!

## 📤 Uploading Videos (Admin Panel)
Once deployed, you can access the admin upload panel at `/admin/upload`. The app uses a 10MB chunked TUS upload system to bypass network limits, allowing you to upload massive multi-gigabyte files effortlessly.

---
**Note:** `.tmp` and `.env` files are ignored to prevent large files and secrets from being committed. Ensure you configure your environment variables safely in your hosting provider's dashboard.
