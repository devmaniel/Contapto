import { useCallback, useState } from "react"

export interface PurchaseTokenRequest {
  amount: number
  tokenAmount: number
  currency: string
  currentPrice: number
}

export interface PurchaseTokenResponse {
  transactionId: string
  tokensPurchased: number
  amountPaid: number
  currency: string
  newBalance: number
  timestamp: string
}

export interface PurchaseError {
  message: string
  code: string
}

interface UsePurchaseTokenState {
  loading: boolean
  error: PurchaseError | null
  data: PurchaseTokenResponse | null
}

export const usePurchaseToken = () => {
  const [{ loading, error, data }, setState] = useState<UsePurchaseTokenState>({
    loading: false,
    error: null,
    data: null,
  })

  const purchaseToken = useCallback(async (request: PurchaseTokenRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    // Validate purchase amount
    if (request.amount <= 0) {
      setState({
        loading: false,
        data: null,
        error: {
          message: "Purchase amount must be greater than 0",
          code: "invalid_amount",
        },
      })
      return null
    }

    if (request.tokenAmount <= 0) {
      setState({
        loading: false,
        data: null,
        error: {
          message: "Token amount must be greater than 0",
          code: "invalid_token_amount",
        },
      })
      return null
    }

    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate potential errors (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Network error occurred during purchase")
      }

      // Generate mock transaction response
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newBalance = 50000 - request.amount // Mock: starting with 50000 Credits - spent amount

      const response: PurchaseTokenResponse = {
        transactionId,
        tokensPurchased: request.tokenAmount,
        amountPaid: request.amount,
        currency: request.currency,
        newBalance,
        timestamp: new Date().toISOString(),
      }

      setState({ loading: false, error: null, data: response })
      return response
    } catch (err: unknown) {
      const unknownError = err as { message?: string }
      setState({
        loading: false,
        data: null,
        error: {
          message: unknownError?.message ?? "Purchase failed. Please try again.",
          code: "purchase_failed",
        },
      })
      return null
    }
  }, [])

  return {
    purchaseToken,
    loading,
    error,
    data,
  }
}
