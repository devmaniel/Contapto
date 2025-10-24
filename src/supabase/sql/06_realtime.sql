-- ============================================
-- REALTIME CONFIGURATION
-- ============================================
-- Enable real-time subscriptions for tables
-- Run this independently to enable/update realtime settings

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for calls
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
