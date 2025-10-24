-- ============================================
-- FIX MISSING PROFILES
-- ============================================
-- Run this if your auth users don't have profiles

-- 1. Check which users are missing profiles
SELECT 
  u.id,
  u.phone,
  u.email,
  u.created_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ Missing Profile'
    ELSE '✅ Has Profile'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Create missing profiles for existing users
INSERT INTO public.profiles (id, phone, display_name)
SELECT 
  u.id,
  COALESCE(u.phone, u.email, 'unknown') as phone,
  COALESCE(u.raw_user_meta_data->>'display_name', u.phone, u.email, 'User') as display_name
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify all users now have profiles
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as missing_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- 4. Show all profiles with their phone numbers
SELECT 
  p.id,
  p.phone,
  p.display_name,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- ============================================
-- OPTIONAL: Update phone format in profiles
-- ============================================
-- If your profiles have phones with + but auth.users don't (or vice versa)

-- Check current phone formats
SELECT 
  phone,
  CASE 
    WHEN phone LIKE '+%' THEN 'Has + prefix'
    WHEN phone LIKE '63%' THEN 'No + prefix (63)'
    WHEN phone LIKE '09%' THEN 'Philippine format (09)'
    ELSE 'Other format'
  END as format,
  COUNT(*) as count
FROM public.profiles
GROUP BY phone, format;

-- Normalize all phones to 63xxxxxxxxx format (without +)
UPDATE public.profiles
SET phone = CASE
  WHEN phone LIKE '+63%' THEN SUBSTRING(phone FROM 2)  -- Remove +
  WHEN phone LIKE '09%' THEN '63' || SUBSTRING(phone FROM 2)  -- Convert 09 to 63
  ELSE phone
END
WHERE phone LIKE '+63%' OR phone LIKE '09%';

-- Verify the update
SELECT phone, COUNT(*) 
FROM public.profiles 
GROUP BY phone;
