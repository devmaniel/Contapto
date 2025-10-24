# Supabase SQL Schema Files

This directory contains the database schema for the messaging application. The schema is organized into modular files for easy maintenance and incremental updates.

## 📁 File Structure

### ⭐ RECOMMENDED: All-In-One Schema (Latest)
- **`COMPLETE_SCHEMA_ALL_IN_ONE.sql`** - **USE THIS!** Complete schema with EVERYTHING:
  - Drops all existing tables
  - Creates: Profiles, Conversations, Messages, Calls, Credits, Transactions
  - Includes blockchain integration fields
  - RLS policies, indexes, triggers, realtime
  - Single file, one-click setup

### Legacy Complete Schema
- **`supabase-schema.sql`** - Old complete schema (messaging only, no blockchain)

### Modular Files (Run Independently)
1. **`01_tables_profiles.sql`** - Profiles table with RLS policies and indexes
2. **`02_tables_conversations.sql`** - Conversations table with RLS policies and indexes
3. **`03_tables_messages.sql`** - Messages table with RLS policies and indexes
4. **`04_tables_calls.sql`** - Calls table with RLS policies and indexes
5. **`05_functions_triggers.sql`** - Database functions and triggers
6. **`06_realtime.sql`** - Realtime configuration for live updates

### Additional Schemas
- **`credits-transactions-schema.sql`** - Credits & transactions (without blockchain)
- **`blockchain-integration-migration.sql`** - Add blockchain fields to existing tables
- **`fix-profiles.sql`** - Fix missing profiles

## 🚀 Usage

### ⭐ RECOMMENDED: Fresh Start (Reset Everything)
**Use this if you want to start clean with blockchain integration:**

1. Go to Supabase Dashboard → SQL Editor
2. Open `COMPLETE_SCHEMA_ALL_IN_ONE.sql`
3. Copy all content
4. Paste into SQL Editor
5. Click "Run"
6. ✅ Done! All tables created with blockchain support

**What it does:**
- Drops all existing tables (⚠️ deletes all data!)
- Creates fresh tables with blockchain fields
- Sets up RLS, indexes, triggers, realtime
- Ready for blockchain integration

### Initial Setup (New Database - Legacy)
Run the complete schema file in your Supabase SQL Editor:
```sql
-- Run this file:
supabase-schema.sql
```

### Incremental Updates (Existing Database)
Run only the specific module you need to update. For example:

**Update only the calls table:**
```sql
-- Run this file:
04_tables_calls.sql
```

**Update only functions and triggers:**
```sql
-- Run this file:
05_functions_triggers.sql
```

**Update only RLS policies for messages:**
```sql
-- Run this file:
03_tables_messages.sql
```

## 🔄 When to Use Each Approach

### Use Complete Schema (`supabase-schema.sql`) when:
- ✅ Setting up a new database from scratch
- ✅ Resetting the entire database
- ✅ Deploying to a new environment (staging, production)
- ✅ You want to ensure everything is in sync

### Use Modular Files when:
- ✅ Adding a new column to an existing table
- ✅ Updating RLS policies without affecting other tables
- ✅ Modifying indexes for performance
- ✅ Updating functions or triggers
- ✅ You don't want to drop and recreate tables (preserves data)

## 📋 Table Dependencies

**Dependency Order (if running all modules):**
1. `01_tables_profiles.sql` (depends on auth.users)
2. `02_tables_conversations.sql` (depends on auth.users)
3. `03_tables_messages.sql` (depends on conversations)
4. `04_tables_calls.sql` (depends on auth.users)
5. `05_functions_triggers.sql` (depends on profiles, calls)
6. `06_realtime.sql` (depends on all tables)

## 🛡️ Safety Features

All modular files use:
- `CREATE TABLE IF NOT EXISTS` - Won't fail if table exists
- `CREATE INDEX IF NOT EXISTS` - Won't fail if index exists
- `DROP POLICY IF EXISTS` before `CREATE POLICY` - Ensures clean policy updates
- `CREATE OR REPLACE FUNCTION` - Updates functions without dropping

## 💡 Examples

### Example 1: Add a new field to profiles
1. Edit `01_tables_profiles.sql`
2. Add your new column (e.g., `bio TEXT`)
3. Run only `01_tables_profiles.sql` in Supabase SQL Editor
4. Data in existing profiles is preserved

### Example 2: Update call timeout logic
1. Edit `05_functions_triggers.sql`
2. Modify the function logic
3. Run only `05_functions_triggers.sql`
4. New function replaces old one

### Example 3: Change RLS policy for messages
1. Edit `03_tables_messages.sql`
2. Update the policy definition
3. Run only `03_tables_messages.sql`
4. Old policy is dropped, new one is created

## ⚠️ Important Notes

- **Always backup your database** before running schema changes in production
- **Test in development** first before applying to production
- **Review RLS policies** carefully - they control data access security
- **Check dependencies** - some tables reference others (e.g., messages → conversations)
- The complete schema file (`supabase-schema.sql`) will always be kept in sync with all modular files

## 🔍 What Each File Contains

| File | Tables | Indexes | RLS Policies | Functions | Triggers | Realtime |
|------|--------|---------|--------------|-----------|----------|----------|
| `01_tables_profiles.sql` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `02_tables_conversations.sql` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `03_tables_messages.sql` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `04_tables_calls.sql` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `05_functions_triggers.sql` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `06_realtime.sql` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `supabase-schema.sql` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📞 Support

If you encounter issues:
1. Check the Supabase SQL Editor for error messages
2. Verify table dependencies are met
3. Ensure you have proper permissions
4. Review the complete schema file for reference
