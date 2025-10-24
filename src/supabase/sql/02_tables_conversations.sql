-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
-- Stores 1-on-1 chat conversations between two users
-- Run this independently to create/update just the conversations table

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate conversations between same users
  CONSTRAINT unique_participants UNIQUE (participant1_id, participant2_id),
  -- Ensure a user can't chat with themselves
  CONSTRAINT different_participants CHECK (participant1_id != participant2_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
