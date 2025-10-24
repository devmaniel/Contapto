import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CreditsState {
  credits: number
  loading: boolean
  setCredits: (credits: number) => void
  addCredits: (amount: number) => void
  deductCredits: (amount: number) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

/**
 * Global Zustand store for credits balance
 * - Persists to localStorage
 * - Syncs across all components
 * - No re-fetching needed after initial load
 */
export const useCreditsStore = create<CreditsState>()(
  persist(
    (set) => ({
      credits: 0,
      loading: false,

      // Set credits to exact value
      setCredits: (credits: number) => {
        console.log('💳 Zustand: Setting credits to', credits)
        set({ credits })
      },

      // Add credits (increment)
      addCredits: (amount: number) => {
        console.log('💳 Zustand: Adding credits', amount)
        set((state) => ({ credits: state.credits + amount }))
      },

      // Deduct credits (decrement)
      deductCredits: (amount: number) => {
        console.log('💳 Zustand: Deducting credits', amount)
        set((state) => ({ credits: Math.max(0, state.credits - amount) }))
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ loading })
      },

      // Reset to initial state (on logout)
      reset: () => {
        console.log('💳 Zustand: Resetting credits store')
        set({ credits: 0, loading: false })
      },
    }),
    {
      name: 'credits-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)
