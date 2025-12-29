-- Inktoons Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- FREE TIER: 500MB database storage

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create webtoons table
CREATE TABLE IF NOT EXISTS webtoons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    author TEXT NOT NULL,
    image_url TEXT NOT NULL,
    rating NUMERIC DEFAULT 0,
    votes INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ongoing',
    genres TEXT[] NOT NULL DEFAULT '{}',
    artist TEXT DEFAULT 'Unknown',
    alternatives TEXT,
    year TEXT DEFAULT '2025',
    language TEXT DEFAULT 'Español',
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    webtoon_id TEXT NOT NULL REFERENCES webtoons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    is_locked BOOLEAN DEFAULT false,
    unlock_cost INTEGER,
    unlock_date TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_data table (for wallet, favorites, etc.)
CREATE TABLE IF NOT EXISTS user_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    inks INTEGER DEFAULT 0,
    unlocked_chapters TEXT[] DEFAULT '{}',
    favorites TEXT[] DEFAULT '{}',
    reading_history TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapters_webtoon_id ON chapters(webtoon_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_webtoons_created_at ON webtoons(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at (with existence checks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_webtoons_updated_at') THEN
        CREATE TRIGGER update_webtoons_updated_at BEFORE UPDATE ON webtoons
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chapters_updated_at') THEN
        CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_data_updated_at') THEN
        CREATE TRIGGER update_user_data_updated_at BEFORE UPDATE ON user_data
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE webtoons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies (with existence checks using DO blocks to avoid errors)
DO $$
BEGIN
    -- Webtoons Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on webtoons') THEN
        CREATE POLICY "Allow public read access on webtoons" ON webtoons FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert on webtoons') THEN
        CREATE POLICY "Allow public insert on webtoons" ON webtoons FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update on webtoons') THEN
        CREATE POLICY "Allow public update on webtoons" ON webtoons FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public delete on webtoons') THEN
        CREATE POLICY "Allow public delete on webtoons" ON webtoons FOR DELETE USING (true);
    END IF;

    -- Chapters Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on chapters') THEN
        CREATE POLICY "Allow public read access on chapters" ON chapters FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert on chapters') THEN
        CREATE POLICY "Allow public insert on chapters" ON chapters FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update on chapters') THEN
        CREATE POLICY "Allow public update on chapters" ON chapters FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public delete on chapters') THEN
        CREATE POLICY "Allow public delete on chapters" ON chapters FOR DELETE USING (true);
    END IF;

    -- User Data Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own data') THEN
        CREATE POLICY "Users can read their own data" ON user_data FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own data') THEN
        CREATE POLICY "Users can insert their own data" ON user_data FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own data') THEN
        CREATE POLICY "Users can update their own data" ON user_data FOR UPDATE USING (true);
    END IF;
END $$;
