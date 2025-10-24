-- =====================================================
-- USER PROMOS SCHEMA
-- Tracks active promos purchased by users
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

-- Create user_promos table
CREATE TABLE IF NOT EXISTS user_promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_id TEXT NOT NULL,
  promo_name TEXT NOT NULL,
  promo_type promo_type NOT NULL,
  text_allowance INTEGER, -- null means unlimited
  text_used INTEGER DEFAULT 0 NOT NULL,
  call_allowance INTEGER, -- in minutes, null means unlimited
  call_used INTEGER DEFAULT 0 NOT NULL, -- in minutes
  credits_paid INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_user_promos_user_id ON user_promos(user_id);
CREATE INDEX idx_user_promos_user_active ON user_promos(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_promos_expires_at ON user_promos(expires_at);

-- Enable Row Level Security
ALTER TABLE user_promos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own promos
CREATE POLICY "Users can view own promos"
  ON user_promos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own promos
CREATE POLICY "Users can insert own promos"
  ON user_promos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own promos
CREATE POLICY "Users can update own promos"
  ON user_promos
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_promos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_promos_updated_at
  BEFORE UPDATE ON user_promos
  FOR EACH ROW
  EXECUTE FUNCTION update_user_promos_updated_at();

-- Function to auto-expire old promos
CREATE OR REPLACE FUNCTION expire_old_promos()
RETURNS void AS $$
BEGIN
  UPDATE user_promos
  SET is_active = false
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has allowance for text/call
CREATE OR REPLACE FUNCTION check_user_allowance(
  p_user_id UUID,
  p_type TEXT -- 'text' or 'call'
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
      SELECT 1 FROM user_promos
      WHERE user_id = p_user_id
        AND is_active = true
        AND expires_at > NOW()
        AND (promo_type = 'unlimited_both' OR promo_type = 'unlimited_text')
    ) INTO has_unlimited;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM user_promos
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
      SELECT 1 FROM user_promos
      WHERE user_id = p_user_id
        AND is_active = true
        AND expires_at > NOW()
        AND (promo_type = 'limited_both' OR promo_type = 'limited_text')
        AND text_used < text_allowance
    ) INTO has_remaining;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM user_promos
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
