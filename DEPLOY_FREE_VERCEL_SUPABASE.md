# 🚀 100% Free Hosting Guide: Supabase + Vercel

This guide walks you through deploying **Find My Soulmate (Dev Edition)** with **zero monthly costs ($0/mo)** using Supabase Free Tier for database & realtime chat, and Vercel Hobby Tier for the frontend.

---

## 📋 What You Get For Free ($0 / Month)

| Platform | Role | Free Tier Limits |
| :--- | :--- | :--- |
| **Supabase** | Real-time chat, users, database, notifications, posts | 500 MB Postgres database, 200 concurrent Realtime connections, 50,000 monthly active users |
| **Vercel** | High-speed global edge CDN hosting for React SPA | 100 GB bandwidth, unlimited automatic deployments from GitHub |

---

## Step 1: Set Up Free Supabase Database & Realtime (2 Minutes)

1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (log in with GitHub).
2. Click **New project**:
   - **Name**: `find-my-soulmate`
   - **Database Password**: Enter a secure password (save it somewhere safe).
   - **Region**: Choose the region closest to you (e.g. `Frankfurt (eu-central-1)` or `London`).
   - Click **Create new project**.
3. Once the dashboard opens, click the **SQL Editor** icon on the left menu (looks like `>_`).
4. Click **New query**, open the [`supabase/schema.sql`](file:///c:/Users/hp/Desktop/3D-project/find-my-soulmate/supabase/schema.sql) file from this repository, copy all contents, paste it into the query box, and click **Run**.
   * *This instantly creates all tables (`users`, `messages`, `notifications`, `posts`), configures security policies, and enables live Realtime WebSockets!*
5. Go to **Project Settings** (gear icon at the bottom left) -> **API**:
   - Copy **Project URL** (e.g. `https://xyzabcdefg.supabase.co`)
   - Copy **anon public** key (starts with `eyJhbGciOi...`)

---

## Step 2: Deploy Frontend on Vercel For Free (2 Minutes)

1. Go to [https://vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Find your repository **`find-my-soulmate`** and click **Import**.
4. In the configuration screen:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add these two variables from Step 1:
   - `VITE_SUPABASE_URL` = `<your Supabase Project URL>`
   - `VITE_SUPABASE_ANON_KEY` = `<your Supabase anon public key>`
   *(Optional: If you want Gemini AI chat available globally without entering keys in the UI, you can also add `VITE_GEMINI_API_KEY`)*
6. Click **Deploy**.

---

## Step 3: Done! 🎉

In less than 60 seconds, Vercel will give you a live HTTPS link (such as `https://find-my-soulmate.vercel.app`):
- Anyone with the link can open it on their phone, laptop, or tablet.
- Users can register, log in with their Love Code, send direct messages, voice clips, and code snippets.
- Real-time messages and notifications sync instantaneously across all devices globally through Supabase with **zero server costs**.
