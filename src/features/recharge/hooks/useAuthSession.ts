import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/supabase-api'
import type { Session } from '@supabase/supabase-js'

/**
 * Lightweight hook to get the current auth session synchronously.
 * Uses cached session data - no loading state needed.
 */
export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get cached session synchronously
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return session
}
