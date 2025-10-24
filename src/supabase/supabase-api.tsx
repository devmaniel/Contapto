import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const jwtExpirationMinutes = parseInt(import.meta.env.VITE_JWT_EXPIRATION_MINUTES || '10', 10);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create and export the Supabase client with JWT expiration config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // JWT expiration is controlled by Supabase server settings
    // This client-side config ensures proper session management
  },
});

// Export JWT expiration for reference
export const JWT_EXPIRATION_MINUTES = jwtExpirationMinutes;
