-- ==============================================================================
-- INKTOONS DATABASE FUNCTIONS (RPC)
-- ==============================================================================

-- 1. Ensure required columns exist for creator economy
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS creator_balance NUMERIC DEFAULT 0;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS creator_inks_balance NUMERIC DEFAULT 0;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS creator_transactions JSONB DEFAULT '[]'::jsonb;

-- 2. Create a secure function to process donations
-- This allows a user (donor) to update another user's (creator) balance and history
-- SECURITY DEFINER bypasses RLS policies for this specific function.

CREATE OR REPLACE FUNCTION process_creator_donation(
    p_username TEXT,
    p_amount NUMERIC,
    p_transaction JSONB
)
RETURNS VOID AS $$
BEGIN
    -- Update the recipient's balance and prepend the new transaction to history
    UPDATE user_data
    SET 
        creator_balance = COALESCE(creator_balance, 0) + p_amount,
        creator_transactions = jsonb_build_array(p_transaction) || COALESCE(creator_transactions, '[]'::jsonb)
    WHERE username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to process Inks donations (if needed separately)
CREATE OR REPLACE FUNCTION process_creator_inks_donation(
    p_username TEXT,
    p_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_data
    SET creator_inks_balance = COALESCE(creator_inks_balance, 0) + p_amount
    WHERE username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
