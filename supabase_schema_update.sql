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
