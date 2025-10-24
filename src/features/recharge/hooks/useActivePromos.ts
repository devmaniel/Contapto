import { useState, useEffect, useCallback } from 'react'
import { getPromoSummary } from '../api/supabasePromos'
import { useAuthSession } from './useAuthSession'
import { usePromosStore } from '@/shared/stores/usePromosStore'

/**
 * Hook to fetch and manage active promos for current user
 * Used in navbar to display text/call allowances
 * Syncs with Zustand store for global state
 */
export function useActivePromos() {
  const session = useAuthSession()
  const userId = session?.user?.id
  
  // Get from Zustand store
  const summary = usePromosStore((state) => state.summary)
  const setSummary = usePromosStore((state) => state.setSummary)
  const loading = usePromosStore((state) => state.loading)
  const setLoading = usePromosStore((state) => state.setLoading)
  
  const [error, setError] = useState<string | null>(null)

  const fetchPromos = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const promoSummary = await getPromoSummary(userId)
      setSummary(promoSummary)
    } catch (err) {
      console.error('❌ Error fetching promos:', err)
      setError('Failed to load promos')
    } finally {
      setLoading(false)
    }
  }, [userId, setLoading, setSummary])

  useEffect(() => {
    fetchPromos()
  }, [fetchPromos])

  return {
    summary,
    loading,
    error,
    refetch: fetchPromos
  }
}
