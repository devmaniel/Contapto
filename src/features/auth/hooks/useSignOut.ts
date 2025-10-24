import { useCallback, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { supabase } from "@/supabase/supabase-api"

interface UseSignOutState {
  loading: boolean
  error: string | null
}

export const useSignOut = () => {
  const navigate = useNavigate()
  const [{ loading, error }, setState] = useState<UseSignOutState>({
    loading: false,
    error: null,
  })

  const signOut = useCallback(async () => {
    setState({ loading: true, error: null })

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        setState({
          loading: false,
          error: signOutError.message,
        })
        return false
      }

      setState({ loading: false, error: null })
      
      // Redirect to login after successful sign out
      navigate({ to: '/login' })
      return true
    } catch (err: unknown) {
      const unknownError = err as { message?: string }
      setState({
        loading: false,
        error: unknownError?.message ?? "Sign out failed",
      })
      return false
    }
  }, [navigate])

  return {
    signOut,
    loading,
    error,
  }
}
