-- ============================================================================
-- Find My Soulmate (Dev Edition) — Supabase Schema & Realtime Setup
-- Free Tier Compatible: Run this in Supabase SQL Editor in 1 click!
-- ============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  love_code TEXT NOT NULL UNIQUE,
  gender TEXT DEFAULT 'other',
  looking_for TEXT DEFAULT 'any',
  location TEXT DEFAULT '',
  tech_stack JSONB DEFAULT '[]'::jsonb,
  bio TEXT DEFAULT '',
  indentation TEXT DEFAULT 'Spaces',
  drink TEXT DEFAULT '☕ Coffee',
  emoji TEXT DEFAULT '🧑‍💻',
  likes INTEGER DEFAULT 0,
  friends JSONB DEFAULT '[]'::jsonb,
  following JSONB DEFAULT '[]'::jsonb,
  followers JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'online',
  current_status TEXT DEFAULT '',
  avatar_data TEXT,
  audio_intro TEXT,
  registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Create Messages Table (1-on-1 Realtime Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  sender_name TEXT,
  sender_handle TEXT,
  sender_emoji TEXT DEFAULT '🧑‍💻',
  text TEXT DEFAULT '',
  image_data TEXT,
  voice_data TEXT,
  code_snippet TEXT,
  code_language TEXT,
  reply_to JSONB,
  status TEXT DEFAULT 'sent',
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indices for instant query speeds
CREATE INDEX IF NOT EXISTS idx_messages_pair ON public.messages (sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages (timestamp ASC);

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  target_user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  from_user JSONB,
  read BOOLEAN DEFAULT false,
  action_status TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_target ON public.notifications (target_user_id);

-- 4. Create Community Posts Table (Social Dev Feed)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_emoji TEXT DEFAULT '🧑‍💻',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 1,
  comments INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON public.posts (timestamp DESC);

-- ============================================================================
-- Row Level Security (RLS) & Public / Anon Access Policies
-- Enables free-tier client-side access with Supabase anon public key
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if re-running
DROP POLICY IF EXISTS "Public users select" ON public.users;
DROP POLICY IF EXISTS "Public users insert" ON public.users;
DROP POLICY IF EXISTS "Public users update" ON public.users;

DROP POLICY IF EXISTS "Public messages select" ON public.messages;
DROP POLICY IF EXISTS "Public messages insert" ON public.messages;
DROP POLICY IF EXISTS "Public messages update" ON public.messages;

DROP POLICY IF EXISTS "Public notifications select" ON public.notifications;
DROP POLICY IF EXISTS "Public notifications insert" ON public.notifications;
DROP POLICY IF EXISTS "Public notifications update" ON public.notifications;

DROP POLICY IF EXISTS "Public posts select" ON public.posts;
DROP POLICY IF EXISTS "Public posts insert" ON public.posts;
DROP POLICY IF EXISTS "Public posts update" ON public.posts;

-- Allow read & write with public/anon key (custom Love Code authorization)
CREATE POLICY "Public users select" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public users insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public users update" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Public messages select" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Public messages insert" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public messages update" ON public.messages FOR UPDATE USING (true);

CREATE POLICY "Public notifications select" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public notifications insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public notifications update" ON public.notifications FOR UPDATE USING (true);

CREATE POLICY "Public posts select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Public posts insert" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public posts update" ON public.posts FOR UPDATE USING (true);

-- ============================================================================
-- Supabase Realtime Replication Setup
-- Broadcasts inserts and updates in real-time to all connected web browsers
-- ============================================================================
DO $$
BEGIN
  -- Enable replication on all tables for Supabase Realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
EXCEPTION WHEN OTHERS THEN
  -- Table might already be in publication, safe to ignore
  NULL;
END $$;

-- Set replica identity to full so update payloads contain the entire row
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;

-- ============================================================================
-- Seed Initial Developers & Community Posts (if not present)
-- ============================================================================
INSERT INTO public.users (id, name, handle, love_code, gender, looking_for, location, tech_stack, bio, indentation, drink, emoji, likes, friends, status, current_status)
VALUES
  ('user_meron', 'Meron Tadesse', '@meron_dev', 'LOVE-MERO-9021', 'female', 'male', 'Addis Ababa 🇪🇹', '["Next.js", "React", "Tailwind", "GraphQL"]'::jsonb, 'Late night frontend builder. Addicted to Ethiopian Bunna and clean component design.', 'Tabs', '☕ Ethiopian Bunna', '👩‍💻', 14, '["user_yonas"]'::jsonb, 'offline', 'Refactoring auth components with Tailwind... need more bunna ☕'),
  ('user_hanna', 'Hanna Lind', '@hanna_codes', 'LOVE-HANN-4432', 'female', 'male', 'Stockholm 🇸🇪', '["TypeScript", "Vue 3", "Node.js"]'::jsonb, 'Building indie SaaS by day, hunting CSS bugs by night. Looking for a genuine dev partner.', 'Spaces', '🍵 Matcha Latte', '👩‍💻', 21, '[]'::jsonb, 'offline', 'Just deployed v1.2 to production without a single error! 🚀'),
  ('user_selam', 'Selamawit Alemayehu', '@selam_ai', 'LOVE-SELA-7719', 'female', 'male', 'Nairobi 🇰🇪', '["Python", "FastAPI", "PyTorch", "Linux"]'::jsonb, 'Training vision models and looking for someone who loves deep talks over bunna.', 'Tabs', '☕ Ethiopian Bunna', '👩‍💻', 38, '["user_alex"]'::jsonb, 'offline', 'Fine-tuning a local LLM while listening to Tilahun Gessesse 🎶'),
  ('user_yonas', 'Yonas Bekele', '@yonas_rust', 'LOVE-YONA-1823', 'male', 'female', 'Addis Ababa 🇪🇹', '["Rust", "WebAssembly", "Linux", "Go"]'::jsonb, 'Zero memory leaks, 100% devotion. Looking for a smart dev girl to share late night commits with.', 'Tabs', '☕ Ethiopian Bunna', '👨‍💻', 27, '["user_meron"]'::jsonb, 'offline', 'Async Rust is pure poetry. Who wants to debate tabs vs spaces? 💻'),
  ('user_alex', 'Alex Rivera', '@alex_fullstack', 'LOVE-ALEX-3392', 'male', 'female', 'Austin 🇺🇸', '["React", "Go", "Docker", "PostgreSQL"]'::jsonb, 'Mechanical keyboard enthusiast. I make great breakfast burritos and clean git trees.', 'Spaces', '🥤 Cold Brew', '👨‍💻', 42, '["user_selam"]'::jsonb, 'offline', 'Just built a real-time WebSocket cluster in Go. Anyone want to test? ⚡'),
  ('user_kenean', 'Kenean Mengistu', '@kenean_arch', 'LOVE-KENE-6651', 'male', 'female', 'London 🇬🇧', '["Elixir", "Distributed Systems", "Tailwind", "Next.js"]'::jsonb, 'Aesthetic enthusiast. I believe in romantic code comments and spontaneous coffee dates.', 'Tabs', '☕ Ethiopian Bunna', '👨‍💻', 31, '[]'::jsonb, 'offline', 'Designing fault-tolerant systems and looking for genuine chemistry ✨')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.posts (id, author_id, author_name, author_handle, author_emoji, content, likes, comments)
VALUES
  ('post_1', 'user_meron', 'Meron Tadesse', '@meron_dev', '👩‍💻', 'Nothing hits better than a fresh cup of Ethiopian Bunna while fixing a complex state management bug ☕❤️', 8, 3),
  ('post_2', 'user_yonas', 'Yonas Bekele', '@yonas_rust', '👨‍💻', 'Hot take: Writing raw SQL is more romantic than using an ORM. Change my mind. 🔥', 14, 7),
  ('post_3', 'user_selam', 'Selamawit Alemayehu', '@selam_ai', '👩‍💻', 'Late night model evaluation done. Looking for someone to chat about ethics in AI and late night walks.', 19, 5)
ON CONFLICT (id) DO NOTHING;
