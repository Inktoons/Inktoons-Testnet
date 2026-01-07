
-- 1. Enable Row Level Security (RLS) on user_data table
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow anyone to READ (SELECT) user profiles (Needed for Founder/Pioneer status, tips, etc.)
CREATE POLICY "Public profiles are viewable by everyone" 
ON user_data FOR SELECT 
USING (true);

-- 3. Create a policy to allow users to INSERT their own data
CREATE POLICY "Users can insert their own profile" 
ON user_data FOR INSERT 
WITH CHECK (auth.uid() = user_id::uuid);

-- 4. Create a policy to allow users to UPDATE their own data
CREATE POLICY "Users can update their own profile" 
ON user_data FOR UPDATE 
USING (auth.uid() = user_id::uuid);

-- 5. Ensure webtoons and chapters are publicly readable
ALTER TABLE webtoons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Webtoons are viewable by everyone" ON webtoons FOR SELECT USING (true);
CREATE POLICY "Users can insert webtoons" ON webtoons FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update webtoons" ON webtoons FOR UPDATE USING (true);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chapters are viewable by everyone" ON chapters FOR SELECT USING (true);
CREATE POLICY "Users can insert chapters" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update chapters" ON chapters FOR UPDATE USING (true);
