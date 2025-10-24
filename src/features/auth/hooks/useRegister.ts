import { useCallback, useState } from "react"

import { supabase } from "@/supabase/supabase-api"

import type { RegisterError, RegisterRequest, RegisterResponse } from "../types"
import { validateRegister } from "../utils/validation"

interface UseRegisterState {
  loading: boolean
  error: RegisterError | null
  data: RegisterResponse | null
}

export const useRegister = () => {
  const [{ loading, error, data }, setState] = useState<UseRegisterState>({
    loading: false,
    error: null,
    data: null,
  })

  const register = useCallback(async (values: RegisterRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const validation = validateRegister(values)
    if (!validation.success) {
      const firstIssue = validation.error.issues.at(0)
      setState({
        loading: false,
        data: null,
        error: {
          message: firstIssue?.message ?? "Invalid registration details",
          code: "validation_error",
        },
      })
      return null
    }

    try {
      const { data: result, error: supabaseError } = await supabase.auth.signUp({
        phone: values.phone,
        password: values.password,
      })

      if (supabaseError) {
        setState({
          loading: false,
          data: null,
          error: {
            message: supabaseError.message,
            code: supabaseError.code,
          },
        })
        return null
      }

      // Manually create profile if trigger didn't work
      // This is a fallback in case the handle_new_user trigger fails
      if (result.user?.id) {
        console.log('📝 Creating profile for user:', result.user.id)
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: result.user.id,
            phone: result.user.phone || values.phone,
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          })

        if (profileError) {
          console.error('❌ Profile creation error:', profileError)
          // Don't fail registration if profile creation fails
          // The trigger might have already created it
        } else {
          console.log('✅ Profile created successfully')
        }
      }

      const response: RegisterResponse = {
        userId: result.user?.id ?? "",
        phone: result.user?.phone ?? null,
      }

      setState({ loading: false, error: null, data: response })
      return response
    } catch (err: unknown) {
      const unknownError = err as { message?: string }
      setState({
        loading: false,
        data: null,
        error: {
          message: unknownError?.message ?? "Registration failed",
        },
      })
      return null
    }
  }, [])

  return {
    register,
    loading,
    error,
    data,
  }
}
