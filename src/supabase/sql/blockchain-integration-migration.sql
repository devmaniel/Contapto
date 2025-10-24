-- ============================================
-- BLOCKCHAIN INTEGRATION MIGRATION
-- ============================================
-- Adds blockchain-related fields to existing credits and transactions tables
-- Run this in Supabase SQL Editor after credits-transactions-schema.sql

-- 1. Add blockchain fields to credits table
ALTER TABLE credits 
  ADD COLUMN IF NOT EXISTS wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS last_blockchain_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blockchain_balance INTEGER DEFAULT 0;

-- 2. Add blockchain fields to transactions table
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS blockchain_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gas_fee_eth DECIMAL(18, 18),
  ADD COLUMN IF NOT EXISTS block_number BIGINT;

-- 3. Create blockchain sync logs table
CREATE TABLE IF NOT EXISTS blockchain_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  supabase_balance INTEGER,
  blockchain_balance INTEGER,
  discrepancy INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_hash 
  ON transactions(blockchain_tx_hash);
  
CREATE INDEX IF NOT EXISTS idx_transactions_blockchain_status 
  ON transactions(blockchain_status);
  
CREATE INDEX IF NOT EXISTS idx_credits_wallet_address 
  ON credits(wallet_address);
  
CREATE INDEX IF NOT EXISTS idx_blockchain_sync_logs_user 
  ON blockchain_sync_logs(user_id);

-- 5. Add comments for documentation
COMMENT ON COLUMN credits.wallet_address IS 'User Ethereum wallet address (0x...)';
COMMENT ON COLUMN credits.blockchain_balance IS 'Cached on-chain balance for fast reads';
COMMENT ON COLUMN credits.last_blockchain_sync IS 'Last time we synced with blockchain';

COMMENT ON COLUMN transactions.blockchain_tx_hash IS 'Ethereum transaction hash (0x...)';
COMMENT ON COLUMN transactions.blockchain_status IS 'Status: pending, confirmed, failed';
COMMENT ON COLUMN transactions.block_number IS 'Block number where tx was mined';
COMMENT ON COLUMN transactions.gas_fee_eth IS 'Gas fee paid in ETH';

COMMENT ON TABLE blockchain_sync_logs IS 'Logs for tracking Supabase ↔ Blockchain synchronization';

-- 6. Enable RLS on new table
ALTER TABLE blockchain_sync_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for blockchain_sync_logs
CREATE POLICY "Users can view their own sync logs"
  ON blockchain_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert sync logs"
  ON blockchain_sync_logs FOR INSERT
  WITH CHECK (true);

-- 8. Grant permissions
GRANT SELECT ON blockchain_sync_logs TO authenticated;
GRANT INSERT ON blockchain_sync_logs TO service_role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the migration worked:

-- Check credits table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'credits';

-- Check transactions table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'transactions';

-- Check blockchain_sync_logs table
-- SELECT * FROM blockchain_sync_logs LIMIT 1;
