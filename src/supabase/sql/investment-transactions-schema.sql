-- =====================================================
-- Investment Transactions Table Schema
-- =====================================================
-- This table tracks all crypto asset purchases made through the invest feature
-- Similar to transactions table but specifically for investment activities

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS investment_transactions CASCADE;

-- Create investment_transactions table
CREATE TABLE investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'token_purchase', -- 'token_purchase', 'token_sale', 'swap'
  payment_method VARCHAR(50), -- 'credits', 'credit-card', 'crypto-wallet'
  
  -- Token information
  token_symbol VARCHAR(20) NOT NULL, -- e.g., 'AP', 'BTC', 'ETH'
  token_name VARCHAR(100) NOT NULL, -- e.g., 'AppToken', 'Bitcoin', 'Ethereum'
  token_amount DECIMAL(20, 8) NOT NULL, -- Amount of tokens purchased
  token_price_at_purchase DECIMAL(20, 2) NOT NULL, -- Price per token at time of purchase
  
  -- Payment amounts
  amount_pesos DECIMAL(20, 2), -- Amount in pesos (if paid with fiat)
  credits_amount DECIMAL(20, 2), -- Amount in credits (if paid with credits)
  total_cost DECIMAL(20, 2) NOT NULL, -- Total cost of transaction
  
  -- Transaction status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  
  -- Blockchain integration (MetaMask wallet)
  wallet_address VARCHAR(255), -- User's MetaMask wallet address
  blockchain_tx_hash VARCHAR(255), -- Transaction hash on blockchain
  blockchain_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  blockchain_confirmed_at TIMESTAMPTZ,
  block_number BIGINT,
  gas_fee_eth DECIMAL(20, 10),
  network VARCHAR(50) DEFAULT 'base-sepolia', -- 'base-sepolia', 'ethereum', 'polygon', etc.
  
  -- Additional metadata
  transfer_note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store payment details, card info (masked), etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on user_id for fast user transaction lookups
CREATE INDEX idx_investment_transactions_user_id ON investment_transactions(user_id);

-- Index on status for filtering by transaction status
CREATE INDEX idx_investment_transactions_status ON investment_transactions(status);

-- Index on blockchain_tx_hash for blockchain verification
CREATE INDEX idx_investment_transactions_blockchain_tx_hash ON investment_transactions(blockchain_tx_hash);

-- Index on created_at for sorting by date
CREATE INDEX idx_investment_transactions_created_at ON investment_transactions(created_at DESC);

-- Index on token_symbol for filtering by token type
CREATE INDEX idx_investment_transactions_token_symbol ON investment_transactions(token_symbol);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own investment transactions
CREATE POLICY "Users can view their own investment transactions"
  ON investment_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own investment transactions
CREATE POLICY "Users can insert their own investment transactions"
  ON investment_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own investment transactions (for status changes)
CREATE POLICY "Users can update their own investment transactions"
  ON investment_transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- Triggers
-- =====================================================

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investment_transactions_updated_at
  BEFORE UPDATE ON investment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_transactions_updated_at();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE investment_transactions IS 'Tracks all crypto asset purchases and sales made through the invest feature';
COMMENT ON COLUMN investment_transactions.token_amount IS 'Amount of tokens purchased (supports up to 8 decimal places for precision)';
COMMENT ON COLUMN investment_transactions.token_price_at_purchase IS 'Price per token at the time of purchase (for historical tracking)';
COMMENT ON COLUMN investment_transactions.payment_method IS 'How the user paid: credits (existing balance), credit-card, or crypto-wallet';
COMMENT ON COLUMN investment_transactions.wallet_address IS 'User MetaMask wallet address where tokens are sent';
COMMENT ON COLUMN investment_transactions.blockchain_tx_hash IS 'Transaction hash on the blockchain for verification';
