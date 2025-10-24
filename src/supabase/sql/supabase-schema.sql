-- ============================================
-- SUPABASE SCHEMA FOR 1-ON-1 MESSAGING APP
-- ============================================
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table (1-on-1 chats between two users)
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

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_item TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls table (for UI-based real-time call signaling)
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

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index for finding conversations by participant
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Index for finding messages by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_date ON public.messages(date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- Index for finding unread messages
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = FALSE;

-- Index for phone lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Index for calls
CREATE INDEX IF NOT EXISTS idx_calls_caller_uuid ON public.calls(caller_uuid);
CREATE INDEX IF NOT EXISTS idx_calls_receiver_uuid ON public.calls(receiver_uuid);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at DESC);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Profiles policies
-- Users can read all profiles (for searching/starting chats)
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Conversations policies
-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- Users can update conversations they're part of (for updated_at)
CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (
    auth.uid() = participant1_id OR 
    auth.uid() = participant2_id
  );

-- Messages policies
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Users can update messages they can see (for marking as read)
CREATE POLICY "Users can update messages in their conversations"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- Calls policies
-- Users can view calls they're involved in
CREATE POLICY "Users can view their calls"
  ON public.calls FOR SELECT
  USING (
    auth.uid() = caller_uuid OR 
    auth.uid() = receiver_uuid
  );

-- Users can create calls as caller
CREATE POLICY "Users can create calls"
  ON public.calls FOR INSERT
  WITH CHECK (auth.uid() = caller_uuid);

-- Users can update calls they're involved in
CREATE POLICY "Users can update their calls"
  ON public.calls FOR UPDATE
  USING (
    auth.uid() = caller_uuid OR 
    auth.uid() = receiver_uuid
  );

-- ============================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.email, 'unknown'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.phone, NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profiles.updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update calls.updated_at
DROP TRIGGER IF EXISTS update_calls_updated_at ON public.calls;
CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. ENABLE REALTIME (for live updates)
-- ============================================

-- Enable realtime for conversations, messages, and calls
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;

-- ============================================
-- 7. SAMPLE DATA (OPTIONAL - for testing)
-- ============================================

-- Uncomment below to insert sample users and conversations for testing
/*
-- Note: You'll need to create actual auth users first via Supabase Auth
-- Then use their UUIDs here

-- Sample conversation
INSERT INTO public.conversations (participant1_id, participant2_id)
VALUES 
  ('user-uuid-1', 'user-uuid-2');

-- Sample messages
INSERT INTO public.messages (conversation_id, sender_id, message_item)
VALUES 
  ('conversation-uuid', 'user-uuid-1', 'Hello!'),
  ('conversation-uuid', 'user-uuid-2', 'Hi there!');
*/

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready for the messaging app.
-- 
-- Next steps:
-- 1. Make sure your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
-- 2. Users will automatically get a profile when they sign up
-- 3. The app will handle creating conversations and sending messages
-- 4. Real-time updates are enabled for live messaging
