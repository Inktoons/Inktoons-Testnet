-- Add explicit tip support columns to chapters table
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS tip_amount NUMERIC;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_tips_enabled BOOLEAN DEFAULT FALSE;

-- Ensure user_data table has necessary columns for profile persistence
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS profile_banner TEXT;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS tips_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS creator_description TEXT;
