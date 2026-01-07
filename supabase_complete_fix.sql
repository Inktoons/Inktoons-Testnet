-- ==============================================================================
-- INKTOONS COMPLETE DATABASE FIX SCRIPT
-- RUN THIS ENTIRE SCRIPT TO FIX PROFILE VISIBILITY AND IMAGE LOADING
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA UPDATES (Safe to run multiple times)
-- ------------------------------------------------------------------------------

-- Add explicit tip support columns to chapters table
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS tip_amount NUMERIC;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_tips_enabled BOOLEAN DEFAULT FALSE;

-- Ensure user_data table has necessary columns for profile persistence
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS profile_banner TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS tips_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS creator_description TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS username TEXT;

-- Add columns for persistence of user lists and history
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS favorites TEXT[] DEFAULT '{}';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS reading_history TEXT[] DEFAULT '{}';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS following TEXT[] DEFAULT '{}';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS liked_chapters TEXT[] DEFAULT '{}';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS ratings JSONB DEFAULT '{}';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS last_read JSONB DEFAULT '{}';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS read_chapters JSONB DEFAULT '{}';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '[]';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS subscription JSONB;

-- ------------------------------------------------------------------------------
-- 2. TABLE SECURITY POLICIES (Row Level Security)
-- ------------------------------------------------------------------------------

-- Enable RLS on tables
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE webtoons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- --> POLICIES FOR USER_DATA <--
-- First drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_data;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_data;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_data;

-- Re-create them correctly
CREATE POLICY "Public profiles are viewable by everyone" 
ON user_data FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON user_data FOR INSERT 
WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own profile" 
ON user_data FOR UPDATE 
USING (auth.uid() = user_id::uuid);


-- --> POLICIES FOR WEBTOONS <--
DROP POLICY IF EXISTS "Webtoons are viewable by everyone" ON webtoons;
DROP POLICY IF EXISTS "Users can insert webtoons" ON webtoons;
DROP POLICY IF EXISTS "Users can update webtoons" ON webtoons;

CREATE POLICY "Webtoons are viewable by everyone" ON webtoons FOR SELECT USING (true);
CREATE POLICY "Users can insert webtoons" ON webtoons FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update webtoons" ON webtoons FOR UPDATE USING (true);


-- --> POLICIES FOR CHAPTERS <--
DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON chapters;
DROP POLICY IF EXISTS "Users can insert chapters" ON chapters;
DROP POLICY IF EXISTS "Users can update chapters" ON chapters;

CREATE POLICY "Chapters are viewable by everyone" ON chapters FOR SELECT USING (true);
CREATE POLICY "Users can insert chapters" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update chapters" ON chapters FOR UPDATE USING (true);


-- ------------------------------------------------------------------------------
-- 3. STORAGE POLICIES (For Images)
-- ------------------------------------------------------------------------------

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('webtoon-images', 'webtoon-images', true)
ON CONFLICT (id) DO NOTHING;

-- --> POLICIES FOR AVATARS <--
DROP POLICY IF EXISTS "Public Avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Note: We often need unique policy names if they are global for storage.objects, 
-- but these specific names are scoped to the table usually. To be safe, we use simple names.

CREATE POLICY "Public Avatars are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- --> POLICIES FOR WEBTOON IMAGES <--
DROP POLICY IF EXISTS "Webtoon images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload webtoon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update webtoon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete webtoon images" ON storage.objects;

CREATE POLICY "Webtoon images are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'webtoon-images');

CREATE POLICY "Users can upload webtoon images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'webtoon-images');

CREATE POLICY "Users can update webtoon images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'webtoon-images');

CREATE POLICY "Users can delete webtoon images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'webtoon-images');
