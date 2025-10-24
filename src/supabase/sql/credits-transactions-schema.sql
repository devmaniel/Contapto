-- =====================================================
-- CREDITS & TRANSACTIONS SCHEMA
-- Purpose: Track user credits balance and purchase history
-- =====================================================

-- =====================================================
-- 1. CREDITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);

-- =====================================================
-- 2. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit_purchase', 'promo_purchase', 'refund')),
  payment_method TEXT CHECK (payment_method IN ('credit-card', 'crypto-wallet')),
  amount_pesos NUMERIC(10, 2),
  credits_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- =====================================================
-- 3. AUTO-UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credits_updated_at
  BEFORE UPDATE ON public.credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Credits: Users can only read/update their own credits
CREATE POLICY "Users can view their own credits"
  ON public.credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.credits
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits"
  ON public.credits
  FOR INSERT
  WITH CHECK (true);

-- Transactions: Users can only view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. HELPER FUNCTION: ADD CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION add_credits_to_user(
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
-- SETUP COMPLETE
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- Then verify tables exist:
-- SELECT * FROM public.credits;
-- SELECT * FROM public.transactions;
