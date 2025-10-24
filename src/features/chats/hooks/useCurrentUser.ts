import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/supabase-api'
import type { User } from '@supabase/supabase-js'

interface UseCurrentUserReturn {
  user: User | null
  loading: boolean
  error: Error | null
}

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          setError(userError)
          setUser(null)
        } else {
          setUser(currentUser)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get user'))
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
