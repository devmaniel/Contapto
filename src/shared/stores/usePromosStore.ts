import { create } from 'zustand'
import type { UserPromo } from '@/supabase/types'

interface PromoSummary {
  hasUnlimitedText: boolean
  hasUnlimitedCalls: boolean
  textUsed: number
  textTotal: number | null
  callUsed: number
  callTotal: number | null
  activePromos: UserPromo[]
}

interface PromosState {
  summary: PromoSummary
  loading: boolean
  setSummary: (summary: PromoSummary) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialSummary: PromoSummary = {
  hasUnlimitedText: false,
  hasUnlimitedCalls: false,
  textUsed: 0,
  textTotal: null,
  callUsed: 0,
  callTotal: null,
  activePromos: []
}

/**
 * Global Zustand store for active promos
 * - Stores promo summary for navbar display
 * - No persistence needed (fetched on load)
 * - Syncs across all components
 */
export const usePromosStore = create<PromosState>((set) => ({
  summary: initialSummary,
  loading: false,

  // Set promo summary
  setSummary: (summary: PromoSummary) => {
    console.log('🎁 Zustand: Setting promo summary', summary)
    set({ summary })
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ loading })
  },

  // Reset to initial state (on logout)
  reset: () => {
    console.log('🎁 Zustand: Resetting promos store')
    set({ summary: initialSummary, loading: false })
  },
}))
