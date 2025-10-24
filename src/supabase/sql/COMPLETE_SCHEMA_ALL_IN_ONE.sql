-- ============================================
-- COMPLETE DATABASE SCHEMA - ALL IN ONE
-- ============================================
-- This file drops all existing tables and recreates everything from scratch
-- Includes: Profiles, Conversations, Messages, Calls, Credits, Transactions, 
--           Investment Transactions, User Promos, Blockchain Integration
-- Run this in Supabase SQL Editor to reset your entire database
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING TABLES & TYPES
-- ============================================
DROP TABLE IF EXISTS public.user_promos CASCADE;
DROP TABLE IF EXISTS public.investment_transactions CASCADE;
DROP TABLE IF EXISTS public.blockchain_sync_logs CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.credits CASCADE;
DROP TABLE IF EXISTS public.calls CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS promo_type CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_promos_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_investment_transactions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.add_credits_to_user(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.expire_old_promos() CASCADE;
DROP FUNCTION IF EXISTS public.check_user_allowance(UUID, TEXT) CASCADE;

-- NOTE: We don't drop handle_new_user() or on_auth_user_created trigger
-- as they are part of your existing authentication setup

-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

-- =====================================================
-- 2.1 PROFILES TABLE
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- =====================================================
-- 2.2 CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_participants CHECK (participant1_id != participant2_id),
  CONSTRAINT unique_conversation UNIQUE (participant1_id, participant2_id)
);

-- Indexes
CREATE INDEX idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- =====================================================
-- 2.3 MESSAGES TABLE
-- =====================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_item TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_date ON public.messages(date DESC);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

-- =====================================================
-- 2.4 CALLS TABLE
-- =====================================================
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_uuid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_uuid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  caller_phone TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'answered', 'rejected', 'didnt_answer', 'ended')),
  call_started_at TIMESTAMPTZ DEFAULT NOW(),
  call_ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calls_caller ON public.calls(caller_uuid);
CREATE INDEX idx_calls_receiver ON public.calls(receiver_uuid);
CREATE INDEX idx_calls_status ON public.calls(status);
CREATE INDEX idx_calls_created_at ON public.calls(created_at DESC);

-- =====================================================
-- 2.5 CREDITS TABLE (WITH BLOCKCHAIN FIELDS)
-- =====================================================
CREATE TABLE public.credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
  wallet_address TEXT,
  blockchain_balance INTEGER DEFAULT 0,
  last_blockchain_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credits_user_id ON public.credits(user_id);
CREATE INDEX idx_credits_wallet_address ON public.credits(wallet_address);

-- Comments
COMMENT ON COLUMN public.credits.wallet_address IS 'User Ethereum wallet address (0x...)';
COMMENT ON COLUMN public.credits.blockchain_balance IS 'Cached on-chain balance for fast reads';
COMMENT ON COLUMN public.credits.last_blockchain_sync IS 'Last time we synced with blockchain';

-- =====================================================
-- 2.6 TRANSACTIONS TABLE (WITH BLOCKCHAIN FIELDS)
-- =====================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_purchase', 'promo_purchase', 'refund')),
  payment_method TEXT CHECK (payment_method IN ('credit-card', 'crypto-wallet')),
  amount_pesos NUMERIC(10, 2),
  credits_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  blockchain_tx_hash TEXT,
  blockchain_status TEXT DEFAULT 'pending' CHECK (blockchain_status IN ('pending', 'confirmed', 'failed')),
  blockchain_confirmed_at TIMESTAMPTZ,
  gas_fee_eth DECIMAL(18, 18),
  block_number BIGINT,
  transfer_note TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_blockchain_hash ON public.transactions(blockchain_tx_hash);
CREATE INDEX idx_transactions_blockchain_status ON public.transactions(blockchain_status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Comments
COMMENT ON COLUMN public.transactions.blockchain_tx_hash IS 'Ethereum transaction hash (0x...)';
COMMENT ON COLUMN public.transactions.blockchain_status IS 'Status: pending, confirmed, failed';
COMMENT ON COLUMN public.transactions.block_number IS 'Block number where tx was mined';
COMMENT ON COLUMN public.transactions.gas_fee_eth IS 'Gas fee paid in ETH';

-- =====================================================
-- 2.7 BLOCKCHAIN SYNC LOGS TABLE
-- =====================================================
CREATE TABLE public.blockchain_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  supabase_balance INTEGER,
  blockchain_balance INTEGER,
  discrepancy INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blockchain_sync_logs_user ON public.blockchain_sync_logs(user_id);

-- Comments
COMMENT ON TABLE public.blockchain_sync_logs IS 'Logs for tracking Supabase ↔ Blockchain synchronization';

-- =====================================================
-- 2.8 INVESTMENT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE public.investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'token_purchase',
  payment_method VARCHAR(50),
  
  -- Token information
  token_symbol VARCHAR(20) NOT NULL,
  token_name VARCHAR(100) NOT NULL,
  token_amount DECIMAL(20, 8) NOT NULL,
  token_price_at_purchase DECIMAL(20, 2) NOT NULL,
  
  -- Payment amounts
  amount_pesos DECIMAL(20, 2),
  credits_amount DECIMAL(20, 2),
  total_cost DECIMAL(20, 2) NOT NULL,
  
  -- Transaction status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- Blockchain integration
  wallet_address VARCHAR(255),
  blockchain_tx_hash VARCHAR(255),
  blockchain_status VARCHAR(50) DEFAULT 'pending',
  blockchain_confirmed_at TIMESTAMPTZ,
  block_number BIGINT,
  gas_fee_eth DECIMAL(20, 10),
  network VARCHAR(50) DEFAULT 'base-sepolia',
  
  -- Additional metadata
  transfer_note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_investment_transactions_user_id ON public.investment_transactions(user_id);
CREATE INDEX idx_investment_transactions_status ON public.investment_transactions(status);
CREATE INDEX idx_investment_transactions_blockchain_tx_hash ON public.investment_transactions(blockchain_tx_hash);
CREATE INDEX idx_investment_transactions_created_at ON public.investment_transactions(created_at DESC);
CREATE INDEX idx_investment_transactions_token_symbol ON public.investment_transactions(token_symbol);

-- Comments
COMMENT ON TABLE public.investment_transactions IS 'Tracks all crypto asset purchases and sales made through the invest feature';
COMMENT ON COLUMN public.investment_transactions.token_amount IS 'Amount of tokens purchased (supports up to 8 decimal places for precision)';
COMMENT ON COLUMN public.investment_transactions.wallet_address IS 'User MetaMask wallet address where tokens are sent';

-- =====================================================
-- 2.9 USER PROMOS TABLE
-- =====================================================
-- Create enum for promo types
CREATE TYPE promo_type AS ENUM (
  'unlimited_both',
  'unlimited_text',
  'unlimited_calls',
  'limited_both',
  'limited_text',
  'limited_calls'
);

CREATE TABLE public.user_promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_id TEXT NOT NULL,
  promo_name TEXT NOT NULL,
  promo_type promo_type NOT NULL,
  text_allowance INTEGER,
  text_used INTEGER DEFAULT 0 NOT NULL,
  call_allowance INTEGER,
  call_used INTEGER DEFAULT 0 NOT NULL,
  credits_paid INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_promos_user_id ON public.user_promos(user_id);
CREATE INDEX idx_user_promos_user_active ON public.user_promos(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_promos_expires_at ON public.user_promos(expires_at);

-- ============================================
-- STEP 3: CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- =====================================================
-- 3.1 AUTO-UPDATE TIMESTAMP FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credits_updated_at
  BEFORE UPDATE ON public.credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investment_transactions_updated_at
  BEFORE UPDATE ON public.investment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_promos_updated_at
  BEFORE UPDATE ON public.user_promos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 3.2 HELPER FUNCTION: ADD CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_credits_to_user(
  p_user_id UUID,
  p_credits_to_add INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.credits
  SET credits_balance = credits_balance + p_credits_to_add
  WHERE user_id = p_user_id
  RETURNING credits_balance INTO v_new_balance;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3.3 PROMO FUNCTIONS
-- =====================================================
-- Function to auto-expire old promos
CREATE OR REPLACE FUNCTION public.expire_old_promos()
RETURNS void AS $$
BEGIN
  UPDATE public.user_promos
  SET is_active = false
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has allowance for text/call
CREATE OR REPLACE FUNCTION public.check_user_allowance(
  p_user_id UUID,
  p_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_unlimited BOOLEAN;
  has_remaining BOOLEAN;
BEGIN
  -- First expire old promos
  PERFORM expire_old_promos();
  
  -- Check for unlimited promo
  IF p_type = 'text' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_promos
      WHERE user_id = p_user_id
        AND is_active = true
        AND expires_at > NOW()
        AND (promo_type = 'unlimited_both' OR promo_type = 'unlimited_text')
    ) INTO has_unlimited;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.user_promos
      WHERE user_id = p_user_id
        AND is_active = true
        AND expires_at > NOW()
        AND (promo_type = 'unlimited_both' OR promo_type = 'unlimited_calls')
    ) INTO has_unlimited;
  END IF;
  
  IF has_unlimited THEN
    RETURN true;
  END IF;
  
  -- Check for limited promo with remaining allowance
  IF p_type = 'text' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_promos
      WHERE user_id = p_user_id
        AND is_active = true
        AND expires_at > NOW()
        AND (promo_type = 'limited_both' OR promo_type = 'limited_text')
        AND text_used < text_allowance
    ) INTO has_remaining;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.user_promos
      WHERE user_id = p_user_id
        AND is_active = true
        AND expires_at > NOW()
        AND (promo_type = 'limited_both' OR promo_type = 'limited_calls')
        AND call_used < call_allowance
    ) INTO has_remaining;
  END IF;
  
  RETURN has_remaining;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- =====================================================
-- 5.1 PROFILES POLICIES
-- =====================================================
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 5.2 CONVERSATIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update their conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- =====================================================
-- 5.3 MESSAGES POLICIES
-- =====================================================
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- =====================================================
-- 5.4 CALLS POLICIES
-- =====================================================
CREATE POLICY "Users can view their calls"
  ON public.calls FOR SELECT
  USING (auth.uid() = caller_uuid OR auth.uid() = receiver_uuid);

CREATE POLICY "Users can create calls"
  ON public.calls FOR INSERT
  WITH CHECK (auth.uid() = caller_uuid);

CREATE POLICY "Users can update their calls"
  ON public.calls FOR UPDATE
  USING (auth.uid() = caller_uuid OR auth.uid() = receiver_uuid);

-- =====================================================
-- 5.5 CREDITS POLICIES
-- =====================================================
CREATE POLICY "Users can view their own credits"
  ON public.credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits"
  ON public.credits FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 5.6 TRANSACTIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5.7 BLOCKCHAIN SYNC LOGS POLICIES
-- =====================================================
CREATE POLICY "Users can view their own sync logs"
  ON public.blockchain_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert sync logs"
  ON public.blockchain_sync_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 5.8 INVESTMENT TRANSACTIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view their own investment transactions"
  ON public.investment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investment transactions"
  ON public.investment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment transactions"
  ON public.investment_transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5.9 USER PROMOS POLICIES
-- =====================================================
CREATE POLICY "Users can view own promos"
  ON public.user_promos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own promos"
  ON public.user_promos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own promos"
  ON public.user_promos FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- ============================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.blockchain_sync_logs TO authenticated;
GRANT INSERT ON public.blockchain_sync_logs TO service_role;

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
-- Your database is now ready with:
-- ✅ Profiles, Conversations, Messages, Calls
-- ✅ Credits & Transactions (with blockchain fields)
-- ✅ Investment Transactions (token purchases)
-- ✅ User Promos (promo system with allowances)
-- ✅ Blockchain sync logs
-- ✅ RLS policies for security on all tables
-- ✅ Realtime enabled for live updates
-- ✅ Triggers for auto-update timestamps
-- ✅ Helper functions (add_credits, expire_promos, check_allowance)
-- ✅ Uses your existing authentication setup (handle_new_user trigger)
--
-- Tables created:
-- 1. profiles - User profiles with phone, display_name, avatar
-- 2. conversations - 1-on-1 chat conversations
-- 3. messages - Chat messages with read status
-- 4. calls - Call signaling for UI-based calls
-- 5. credits - User credits balance with blockchain fields
-- 6. transactions - Credit/promo purchase transactions
-- 7. investment_transactions - Token purchase transactions
-- 8. user_promos - Active promos with usage tracking
-- 9. blockchain_sync_logs - Blockchain synchronization logs
--
-- Next steps:
-- 1. Verify tables: SELECT * FROM public.profiles;
-- 2. Check realtime: SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- 3. Test by creating a user and profile
-- 4. Integrate with your React app
-- ============================================
