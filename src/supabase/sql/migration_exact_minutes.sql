-- ============================================
-- MIGRATION: Support Exact Second-by-Second Call Usage
-- ============================================
-- Changes call_allowance and call_used from INTEGER to NUMERIC
-- to support decimal minutes (e.g., 0.167 min = 10 seconds)
--
-- WHY: Users want exact deduction, not rounded up
-- EXAMPLE: 10 second call = 0.167 min deducted (not 1 full minute)
--
-- Run this in Supabase SQL Editor

-- 1. Change call_allowance to NUMERIC (supports decimals)
ALTER TABLE public.user_promos 
  ALTER COLUMN call_allowance TYPE NUMERIC(10, 3);

-- 2. Change call_used to NUMERIC (supports decimals)
ALTER TABLE public.user_promos 
  ALTER COLUMN call_used TYPE NUMERIC(10, 3);

-- 3. Update default value for call_used to 0.000
ALTER TABLE public.user_promos 
  ALTER COLUMN call_used SET DEFAULT 0.000;

-- Verify the changes
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'user_promos' 
  AND column_name IN ('call_allowance', 'call_used');

-- Expected output:
-- call_allowance | numeric | 10 | 3
-- call_used      | numeric | 10 | 3

COMMENT ON COLUMN public.user_promos.call_allowance IS 'Call allowance in minutes (decimal). Example: 1.500 = 1 min 30 sec';
COMMENT ON COLUMN public.user_promos.call_used IS 'Call usage in minutes (decimal). Example: 0.167 = 10 seconds';
