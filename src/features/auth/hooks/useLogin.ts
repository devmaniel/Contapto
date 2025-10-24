import { useCallback, useState } from "react"

import { supabase } from "@/supabase/supabase-api"

import type { LoginError, LoginRequest, LoginResponse } from "../types"
import { validateLogin } from "../utils/validation"

interface UseLoginState {
  loading: boolean
  error: LoginError | null
  data: LoginResponse | null
}

export const useLogin = () => {
  const [{ loading, error, data }, setState] = useState<UseLoginState>({
    loading: false,
    error: null,
    data: null,
  })

  const login = useCallback(async (values: LoginRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    const validation = validateLogin(values)
    if (!validation.success) {
      setState({
        loading: false,
        data: null,
        error: {
          message: "Account doesn't exist. Please try again.",
          code: "validation_error",
        },
      })
      return null
    }

    try {
      const { data: result, error: supabaseError } = await supabase.auth.signInWithPassword({
        phone: values.phone,
        password: values.password,
      })

      if (supabaseError) {
        // Map Supabase error codes to user-friendly messages
        let errorMessage = "Something went wrong. Please try again."
        let errorCode = supabaseError.code || "unknown_error"

        if (supabaseError.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid phone number or password. Please check your credentials and try again."
          errorCode = "invalid_credentials"
        } else if (supabaseError.message.includes("Email not confirmed")) {
          errorMessage = "Your account has not been verified. Please check your phone for verification."
          errorCode = "not_verified"
        } else if (supabaseError.message.includes("User not found")) {
          errorMessage = "Account doesn't exist. Please check your phone number or sign up."
          errorCode = "user_not_found"
        } else if (supabaseError.status === 429) {
          errorMessage = "Too many login attempts. Please try again later."
          errorCode = "rate_limit"
        } else if (!navigator.onLine) {
          errorMessage = "No internet connection. Please check your network and try again."
          errorCode = "network_error"
        }

        setState({
          loading: false,
          data: null,
          error: {
            message: errorMessage,
            code: errorCode,
          },
        })
        return null
      }

      // Check if profile exists, create if missing (fallback for old users)
      if (result.user?.id) {
        console.log('🔍 Checking profile for user:', result.user.id)
        
        const { error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', result.user.id)
          .single()

        if (checkError && checkError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('📝 Profile not found, creating...')
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: result.user.id,
              phone: result.user.phone || values.phone,
            })

          if (profileError) {
            console.error('❌ Profile creation error:', profileError)
          } else {
            console.log('✅ Profile created successfully')
          }
        } else if (!checkError) {
          console.log('✅ Profile already exists')
        }
      }

      const response: LoginResponse = {
        userId: result.user?.id ?? "",
        phone: result.user?.phone ?? null,
        accessToken: result.session?.access_token,
      }

      setState({ loading: false, error: null, data: response })
      return response
    } catch (err) {
      // Handle network or unexpected errors
      const isNetworkError = !navigator.onLine || (err instanceof Error && err.message.includes("fetch"))
      
      setState({
        loading: false,
        data: null,
        error: {
          message: isNetworkError 
            ? "Unable to connect to the server. Please check your internet connection."
            : "An unexpected error occurred. Please try again later.",
          code: isNetworkError ? "network_error" : "server_error",
        },
      })
      return null
    }
  }, [])

  return {
    login,
    loading,
    error,
    data,
  }
}
