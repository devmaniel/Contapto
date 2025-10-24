-- ============================================
-- SEED CONVERSATIONS AND MESSAGES FOR USER 639111111111
-- ============================================
-- Creates conversations between user 639111111111 and all other test users
-- User 639111111111 ID: 91012a74-032c-4e38-8478-015da81ec594
-- Also creates sample messages for each conversation

-- ============================================
-- STEP 1: INSERT CONVERSATIONS
-- ============================================
INSERT INTO public.conversations (id, participant1_id, participant2_id, created_at, updated_at)
VALUES
  -- Conversation with 639567890123
  ('c1111111-0001-0000-0000-000000000001', '91012a74-032c-4e38-8478-015da81ec594', '2a9348ba-cdec-4aae-8267-680611cdc71d', '2025-10-24 14:01:37.961136+00', '2025-10-24 14:01:37.961136+00'),
  
  -- Conversation with 639345678901
  ('c1111111-0002-0000-0000-000000000002', '91012a74-032c-4e38-8478-015da81ec594', '30fabc74-bd65-4705-bee1-141bdca6f31b', '2025-10-24 14:00:59.263975+00', '2025-10-24 14:00:59.263975+00'),
  
  -- Conversation with 639901234567
  ('c1111111-0003-0000-0000-000000000003', '91012a74-032c-4e38-8478-015da81ec594', '3a85bb7c-68cb-4c27-ac89-da3f40c17434', '2025-10-24 14:02:27.899199+00', '2025-10-24 14:02:27.899199+00'),
  
  -- Conversation with 639234567890
  ('c1111111-0004-0000-0000-000000000004', '91012a74-032c-4e38-8478-015da81ec594', '55140a44-4857-4cb3-ba06-345e324c1f0e', '2025-10-24 14:00:32.418792+00', '2025-10-24 14:00:32.418792+00'),
  
  -- Conversation with 639890123456
  ('c1111111-0005-0000-0000-000000000005', '91012a74-032c-4e38-8478-015da81ec594', '65b8e3a4-afdd-4fb5-a63d-a5659238df1d', '2025-10-24 14:02:12.171836+00', '2025-10-24 14:02:12.171836+00'),
  
  -- Conversation with 639012345678
  ('c1111111-0006-0000-0000-000000000006', '91012a74-032c-4e38-8478-015da81ec594', 'aaf6bd85-10c3-4517-a149-1abb6b131224', '2025-10-24 14:02:38.017412+00', '2025-10-24 14:02:38.017412+00'),
  
  -- Conversation with 639789012345
  ('c1111111-0007-0000-0000-000000000007', '91012a74-032c-4e38-8478-015da81ec594', 'd351ed16-06de-4b95-88f9-85491f8dd764', '2025-10-24 14:02:00.80001+00', '2025-10-24 14:02:00.80001+00'),
  
  -- Conversation with 639123456789
  ('c1111111-0008-0000-0000-000000000008', '91012a74-032c-4e38-8478-015da81ec594', 'f1e6b5fe-afd3-4593-a950-22f73ebd7329', '2025-10-24 14:00:04.038926+00', '2025-10-24 14:00:04.038926+00'),
  
  -- Conversation with 639456789012
  ('c1111111-0009-0000-0000-000000000009', '91012a74-032c-4e38-8478-015da81ec594', 'f20a09d2-3372-4626-b7f2-d5ad44798a7a', '2025-10-24 14:01:14.721121+00', '2025-10-24 14:01:14.721121+00'),
  
  -- Conversation with 639678901234
  ('c1111111-0010-0000-0000-000000000010', '91012a74-032c-4e38-8478-015da81ec594', 'fde26d11-1c5a-4713-8c74-e6564550d98d', '2025-10-24 14:01:49.017902+00', '2025-10-24 14:01:49.017902+00')
ON CONFLICT (participant1_id, participant2_id) DO NOTHING;

-- ============================================
-- STEP 2: INSERT MESSAGES FOR EACH CONVERSATION
-- ============================================

-- Messages for conversation with 639567890123
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0001-0000-0000-000000000001', '2a9348ba-cdec-4aae-8267-680611cdc71d', 'Hey! How are you?', '2025-10-24 14:01:40+00', true, '2025-10-24 14:01:40+00'),
  ('c1111111-0001-0000-0000-000000000001', '91012a74-032c-4e38-8478-015da81ec594', 'I''m good! Thanks for asking', '2025-10-24 14:02:15+00', true, '2025-10-24 14:02:15+00'),
  ('c1111111-0001-0000-0000-000000000001', '2a9348ba-cdec-4aae-8267-680611cdc71d', 'Want to grab coffee later?', '2025-10-24 14:03:00+00', false, '2025-10-24 14:03:00+00');

-- Messages for conversation with 639345678901
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0002-0000-0000-000000000002', '91012a74-032c-4e38-8478-015da81ec594', 'Did you finish the project?', '2025-10-24 14:01:00+00', true, '2025-10-24 14:01:00+00'),
  ('c1111111-0002-0000-0000-000000000002', '30fabc74-bd65-4705-bee1-141bdca6f31b', 'Almost done! Just need to test it', '2025-10-24 14:01:30+00', true, '2025-10-24 14:01:30+00'),
  ('c1111111-0002-0000-0000-000000000002', '91012a74-032c-4e38-8478-015da81ec594', 'Great! Let me know when it''s ready', '2025-10-24 14:02:00+00', false, '2025-10-24 14:02:00+00');

-- Messages for conversation with 639901234567
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0003-0000-0000-000000000003', '3a85bb7c-68cb-4c27-ac89-da3f40c17434', 'Check out this cool link!', '2025-10-24 14:02:30+00', true, '2025-10-24 14:02:30+00'),
  ('c1111111-0003-0000-0000-000000000003', '91012a74-032c-4e38-8478-015da81ec594', 'Wow, that''s amazing!', '2025-10-24 14:03:00+00', false, '2025-10-24 14:03:00+00');

-- Messages for conversation with 639234567890
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0004-0000-0000-000000000004', '91012a74-032c-4e38-8478-015da81ec594', 'Happy birthday! 🎉', '2025-10-24 14:00:35+00', true, '2025-10-24 14:00:35+00'),
  ('c1111111-0004-0000-0000-000000000004', '55140a44-4857-4cb3-ba06-345e324c1f0e', 'Thank you so much! 😊', '2025-10-24 14:01:00+00', true, '2025-10-24 14:01:00+00'),
  ('c1111111-0004-0000-0000-000000000004', '55140a44-4857-4cb3-ba06-345e324c1f0e', 'Are you coming to the party tonight?', '2025-10-24 14:01:30+00', false, '2025-10-24 14:01:30+00');

-- Messages for conversation with 639890123456
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0005-0000-0000-000000000005', '65b8e3a4-afdd-4fb5-a63d-a5659238df1d', 'Can you help me with something?', '2025-10-24 14:02:15+00', true, '2025-10-24 14:02:15+00'),
  ('c1111111-0005-0000-0000-000000000005', '91012a74-032c-4e38-8478-015da81ec594', 'Sure! What do you need?', '2025-10-24 14:02:45+00', false, '2025-10-24 14:02:45+00');

-- Messages for conversation with 639012345678
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0006-0000-0000-000000000006', '91012a74-032c-4e38-8478-015da81ec594', 'Meeting at 3pm today', '2025-10-24 14:02:40+00', true, '2025-10-24 14:02:40+00'),
  ('c1111111-0006-0000-0000-000000000006', 'aaf6bd85-10c3-4517-a149-1abb6b131224', 'Got it, I''ll be there', '2025-10-24 14:03:00+00', true, '2025-10-24 14:03:00+00'),
  ('c1111111-0006-0000-0000-000000000006', 'aaf6bd85-10c3-4517-a149-1abb6b131224', 'Should I bring anything?', '2025-10-24 14:03:15+00', false, '2025-10-24 14:03:15+00');

-- Messages for conversation with 639789012345
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0007-0000-0000-000000000007', '91012a74-032c-4e38-8478-015da81ec594', 'Long time no see!', '2025-10-24 14:02:05+00', true, '2025-10-24 14:02:05+00'),
  ('c1111111-0007-0000-0000-000000000007', 'd351ed16-06de-4b95-88f9-85491f8dd764', 'I know! We should catch up', '2025-10-24 14:02:30+00', false, '2025-10-24 14:02:30+00');

-- Messages for conversation with 639123456789
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0008-0000-0000-000000000008', 'f1e6b5fe-afd3-4593-a950-22f73ebd7329', 'Did you see the game last night?', '2025-10-24 14:00:10+00', true, '2025-10-24 14:00:10+00'),
  ('c1111111-0008-0000-0000-000000000008', '91012a74-032c-4e38-8478-015da81ec594', 'Yes! What a finish!', '2025-10-24 14:00:45+00', true, '2025-10-24 14:00:45+00'),
  ('c1111111-0008-0000-0000-000000000008', 'f1e6b5fe-afd3-4593-a950-22f73ebd7329', 'Best game of the season!', '2025-10-24 14:01:00+00', false, '2025-10-24 14:01:00+00');

-- Messages for conversation with 639456789012
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0009-0000-0000-000000000009', '91012a74-032c-4e38-8478-015da81ec594', 'Thanks for your help yesterday!', '2025-10-24 14:01:20+00', true, '2025-10-24 14:01:20+00'),
  ('c1111111-0009-0000-0000-000000000009', 'f20a09d2-3372-4626-b7f2-d5ad44798a7a', 'No problem! Anytime 😊', '2025-10-24 14:01:50+00', false, '2025-10-24 14:01:50+00');

-- Messages for conversation with 639678901234
INSERT INTO public.messages (conversation_id, sender_id, message_item, date, is_read, created_at)
VALUES
  ('c1111111-0010-0000-0000-000000000010', 'fde26d11-1c5a-4713-8c74-e6564550d98d', 'What''s the plan for tomorrow?', '2025-10-24 14:01:55+00', true, '2025-10-24 14:01:55+00'),
  ('c1111111-0010-0000-0000-000000000010', '91012a74-032c-4e38-8478-015da81ec594', 'Let''s meet at the usual spot', '2025-10-24 14:02:20+00', true, '2025-10-24 14:02:20+00'),
  ('c1111111-0010-0000-0000-000000000010', 'fde26d11-1c5a-4713-8c74-e6564550d98d', 'Sounds good! See you then', '2025-10-24 14:02:45+00', false, '2025-10-24 14:02:45+00');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify conversations
SELECT 
  c.id as conversation_id,
  p1.phone as participant1_phone,
  p2.phone as participant2_phone,
  c.created_at,
  COUNT(m.id) as message_count
FROM public.conversations c
JOIN public.profiles p1 ON c.participant1_id = p1.id
JOIN public.profiles p2 ON c.participant2_id = p2.id
LEFT JOIN public.messages m ON c.id = m.conversation_id
WHERE c.participant1_id = '91012a74-032c-4e38-8478-015da81ec594'
   OR c.participant2_id = '91012a74-032c-4e38-8478-015da81ec594'
GROUP BY c.id, p1.phone, p2.phone, c.created_at
ORDER BY c.created_at DESC;

-- Verify messages
SELECT 
  c.id as conversation_id,
  p1.phone as sender_phone,
  m.message_item,
  m.date,
  m.is_read
FROM public.messages m
JOIN public.conversations c ON m.conversation_id = c.id
JOIN public.profiles p1 ON m.sender_id = p1.id
WHERE c.participant1_id = '91012a74-032c-4e38-8478-015da81ec594'
   OR c.participant2_id = '91012a74-032c-4e38-8478-015da81ec594'
ORDER BY c.id, m.date;
