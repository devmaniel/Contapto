-- ============================================
-- CALLS TABLE
-- ============================================
-- Stores call signaling data for UI-based real-time calls
-- Run this independently to create/update just the calls table

-- Create calls table
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_uuid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_uuid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  caller_phone TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'answered', 'rejected', 'didnt_answer', 'ended')),
  call_started_at TIMESTAMPTZ DEFAULT NOW(),
  call_ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calls_caller_uuid ON public.calls(caller_uuid);
CREATE INDEX IF NOT EXISTS idx_calls_receiver_uuid ON public.calls(receiver_uuid);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at DESC);

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their calls" ON public.calls;
CREATE POLICY "Users can view their calls"
  ON public.calls FOR SELECT
  USING (
    auth.uid() = caller_uuid OR 
    auth.uid() = receiver_uuid
  );

DROP POLICY IF EXISTS "Users can create calls" ON public.calls;
CREATE POLICY "Users can create calls"
  ON public.calls FOR INSERT
  WITH CHECK (auth.uid() = caller_uuid);

DROP POLICY IF EXISTS "Users can update their calls" ON public.calls;
CREATE POLICY "Users can update their calls"
  ON public.calls FOR UPDATE
  USING (
    auth.uid() = caller_uuid OR 
    auth.uid() = receiver_uuid
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
