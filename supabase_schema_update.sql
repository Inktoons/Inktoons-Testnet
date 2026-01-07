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

-- 1. Enable Row Level Security (RLS) on user_data table
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent errors on re-run
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_data;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_data;

-- 3. Create a policy to allow anyone to READ (SELECT) user profiles (Needed for Founder/Pioneer status, tips, etc.)
CREATE POLICY "Public profiles are viewable by everyone" 
ON user_data FOR SELECT 
USING (true);

-- 4. Create a policy to allow users to INSERT their own data
CREATE POLICY "Users can insert their own profile" 
ON user_data FOR INSERT 
WITH CHECK (auth.uid() = user_id::uuid);

-- 5. Create a policy to allow users to UPDATE their own data
CREATE POLICY "Users can update their own profile" 
ON user_data FOR UPDATE 
USING (auth.uid() = user_id::uuid);

-- 6. Ensure webtoons and chapters are publicly readable
ALTER TABLE webtoons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Webtoons are viewable by everyone" ON webtoons;
DROP POLICY IF EXISTS "Users can insert webtoons" ON webtoons;
DROP POLICY IF EXISTS "Users can update webtoons" ON webtoons;

CREATE POLICY "Webtoons are viewable by everyone" ON webtoons FOR SELECT USING (true);
CREATE POLICY "Users can insert webtoons" ON webtoons FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update webtoons" ON webtoons FOR UPDATE USING (true);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chapters are viewable by everyone" ON chapters;
DROP POLICY IF EXISTS "Users can insert chapters" ON chapters;
DROP POLICY IF EXISTS "Users can update chapters" ON chapters;

CREATE POLICY "Chapters are viewable by everyone" ON chapters FOR SELECT USING (true);
CREATE POLICY "Users can insert chapters" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update chapters" ON chapters FOR UPDATE USING (true);