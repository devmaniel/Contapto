import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabase/supabase-api'
import { getUserCredits } from '../api/supabaseRecharge'
import { useAuthSession } from './useAuthSession'
import { useCreditsStore } from '../../../shared/stores/useCreditsStore'
import type { Credits } from '../../../supabase/types'

interface UseCreditsBalanceReturn {
  credits: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and subscribe to user's credits balance
 * Automatically syncs with real-time updates from Supabase
 * Updates global Zustand store for cross-component access
 */
export function useCreditsBalance(): UseCreditsBalanceReturn {
  const session = useAuthSession()
  const userId = session?.user?.id

  // Get Zustand store actions
  const { credits, loading, setCredits, setLoading } = useCreditsStore()
  const [error, setError] = useState<string | null>(null)

  // Fetch credits balance
  const fetchCredits = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    console.log('💳 useCreditsBalance: Fetching credits for user:', userId)
    setLoading(true)
    setError(null)

    try {
      let creditsData = await getUserCredits(userId)
      
      // If no credits record exists, create one with balance 0
      if (!creditsData) {
        console.log('💳 useCreditsBalance: No credits found, initializing with 0 balance')
        const { data, error } = await supabase
          .from('credits')
          .insert({ user_id: userId, credits_balance: 0 })
          .select()
          .single()
        
        if (error) {
          console.error('❌ useCreditsBalance: Error initializing credits:', error)
          throw error
        }
        
        creditsData = data
        console.log('✅ useCreditsBalance: Credits initialized:', creditsData)
      }
      
      if (creditsData) {
        setCredits(creditsData.credits_balance)
        console.log('✅ useCreditsBalance: Credits loaded:', creditsData.credits_balance)
      } else {
        setError('Failed to load credits balance')
        console.error('❌ useCreditsBalance: No credits data found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ useCreditsBalance: Error fetching credits:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, setCredits, setLoading])

  // Initial fetch on mount
  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  // Real-time subscription to credits updates
  useEffect(() => {
    if (!userId) return

    console.log('💳 useCreditsBalance: Setting up real-time subscription for user:', userId)

    const channel = supabase
      .channel(`credits:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'credits',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('💳 useCreditsBalance: Real-time update received:', payload)
          const newCredits = (payload.new as Credits).credits_balance
          setCredits(newCredits)
          console.log('✅ useCreditsBalance: Credits updated to:', newCredits)
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      console.log('💳 useCreditsBalance: Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [userId, setCredits])

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits,
  }
}
