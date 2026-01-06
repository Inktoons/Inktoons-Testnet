-- Add explicit tip support columns to chapters table
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS tip_amount NUMERIC;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_tips_enabled BOOLEAN DEFAULT FALSE;

-- Ensure transaction type for withdrawals is supported (if enum is used)
-- ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'WITHDRAWAL';
