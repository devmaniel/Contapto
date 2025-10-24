import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader, CreditCard, Coins } from 'lucide-react'
import PaymentForm from '../../recharge/components/PaymentForm'
import { validatePaymentForm } from '../../recharge/utils/paymentValidation'
import { formatPhoneNumber } from '../../recharge/utils/phoneFormatter'
import { useBuyToken } from '../hooks/useBuyToken'
import InvestPurchaseSuccessDialog from './InvestPurchaseSuccessDialog'
import { useCreditsStore } from '../../../shared/stores/useCreditsStore'
import { getUserCreditsBalance } from '../api/supabaseInvest'
import { useAuthSession } from '../../recharge/hooks/useAuthSession'

interface InvestOrderSummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  tokenSymbol: string
  tokenName: string
  tokenAmount: number
  tokenPrice: number
  totalCost: number
  userAccount?: string
}

const InvestOrderSummaryDialog: React.FC<InvestOrderSummaryDialogProps> = ({
  isOpen,
  onClose,
  tokenSymbol,
  tokenName,
  tokenAmount,
  tokenPrice,
  totalCost,
  userAccount
}) => {
  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'credits' | 'credit-card'>('credits')
  
  // Credit card data
  const [cardNumber, setCardNumber] = useState('4532 1234 5678 9010')
  const [cardholderName, setCardholderName] = useState('John Doe')
  const [expirationDate, setExpirationDate] = useState('12/25')
  const [securityCode, setSecurityCode] = useState('123')
  
  // Wallet address (required for all payments)
  const [walletAddress, setWalletAddress] = useState('')
  
  const [isSuccess, setIsSuccess] = useState(false)
  const [transactionResult, setTransactionResult] = useState<{
    transactionId?: string
    blockchainTxHash?: string
    blockNumber?: number
    walletAddress?: string
    newBalance?: number
  } | null>(null)
  
  // Use the buy token hook
  const { buyToken, loading: isLoading, error: buyTokenError } = useBuyToken()
  
  // Local error state for UI display
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Get current credits balance from Zustand store (will be updated from Supabase)
  const creditsBalance = useCreditsStore((state) => state.credits)
  const setCredits = useCreditsStore((state) => state.setCredits)
  
  // Get user session
  const session = useAuthSession()
  const userId = session?.user?.id
  
  // State for loading balance
  const [loadingBalance, setLoadingBalance] = useState(false)

  // Fetch real credits balance from Supabase when dialog opens
  useEffect(() => {
    const fetchBalance = async () => {
      if (isOpen && userId) {
        setLoadingBalance(true)
        console.log('💳 InvestOrderDialog: Fetching real credits balance from Supabase...')
        try {
          const balance = await getUserCreditsBalance(userId)
          console.log('✅ InvestOrderDialog: Real balance from Supabase:', balance)
          setCredits(balance) // Update Zustand store with real balance
        } catch (error) {
          console.error('❌ InvestOrderDialog: Error fetching balance:', error)
        } finally {
          setLoadingBalance(false)
        }
      }
    }
    
    fetchBalance()
  }, [isOpen, userId, setCredits])
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false)
      setWalletAddress('')
      setTransactionResult(null)
      setPaymentMethod('credits')
      setErrorMessage(null)
    }
  }, [isOpen])
  
  // Update error message when buyTokenError changes
  useEffect(() => {
    if (buyTokenError) {
      setErrorMessage(buyTokenError)
    }
  }, [buyTokenError])

  // Handle dialog close with state reset
  const handleClose = () => {
    setIsSuccess(false)
    setWalletAddress('')
    setTransactionResult(null)
    onClose()
  }

  if (!isOpen) return null

  const hasEnoughCredits = creditsBalance >= totalCost
  const remainingCredits = creditsBalance - totalCost

  const isFormValid = () => {
    // Wallet address is always required
    if (!walletAddress.trim()) return false
    
    // If paying with credit card, validate card details
    if (paymentMethod === 'credit-card') {
      return validatePaymentForm(cardNumber, cardholderName, expirationDate, securityCode)
    }
    
    // If paying with credits, check balance
    if (paymentMethod === 'credits') {
      return hasEnoughCredits
    }
    
    return true
  }

  const handlePayNow = async () => {
    // Clear previous errors
    setErrorMessage(null)
    
    if (!isFormValid()) {
      setErrorMessage('Please fill in all fields correctly')
      return
    }

    // Prepare payment details
    const paymentDetails: Record<string, unknown> = {
      walletAddress,
    }

    if (paymentMethod === 'credit-card') {
      paymentDetails.cardNumber = cardNumber
      paymentDetails.cardholderName = cardholderName
      paymentDetails.expirationDate = expirationDate
      paymentDetails.securityCode = securityCode
    }

    // Call the buy token hook
    const result = await buyToken({
      tokenSymbol,
      tokenName,
      tokenAmount,
      tokenPrice,
      totalCost,
      paymentMethod,
      paymentDetails,
    })

    if (result.success) {
      setTransactionResult(result)
      setIsSuccess(true)
      setErrorMessage(null)
    }
    // Error is already set by the hook via useEffect
  }

  // Show success dialog
  if (isSuccess) {
    return (
      <InvestPurchaseSuccessDialog
        isOpen={isSuccess}
        onClose={handleClose}
        tokenSymbol={tokenSymbol}
        tokenName={tokenName}
        tokenAmount={tokenAmount}
        totalCost={totalCost}
        paymentMethod={paymentMethod}
        userAccount={userAccount}
        transactionResult={transactionResult}
      />
    )
  }

  const dialogContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
            <p className="text-sm text-green-600 mt-1">Your info is private and secure</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-red-800 mb-1">Payment Failed</h4>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Account */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <span className="text-base font-semibold text-gray-800">Account</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🇵🇭</span>
              <span className="font-medium text-gray-800">{formatPhoneNumber(userAccount)}</span>
            </div>
          </div>

          {/* Token Purchase Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800">Token Purchase</span>
              <span className="text-lg font-bold text-gray-800">{tokenAmount} {tokenSymbol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price per token</span>
              <span className="text-base font-semibold text-gray-800">{tokenPrice.toLocaleString()} Credits</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-base font-semibold text-gray-800">Total Cost</span>
              <span className="text-lg font-bold text-gray-800">{totalCost.toLocaleString()} Credits</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="pt-4 border-t border-gray-200">
            <span className="text-base font-semibold text-gray-800 mb-4 block">Payment Method</span>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Credits Option */}
              <button
                onClick={() => setPaymentMethod('credits')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'credits'
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Coins className={`w-8 h-8 ${paymentMethod === 'credits' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`font-semibold ${paymentMethod === 'credits' ? 'text-primary' : 'text-gray-600'}`}>
                    Use Credits
                  </span>
                  {loadingBalance ? (
                    <span className="text-xs text-gray-500">Loading...</span>
                  ) : (
                    <span className="text-xs text-gray-500">{creditsBalance.toLocaleString()} available</span>
                  )}
                </div>
              </button>

              {/* Credit Card Option */}
              <button
                onClick={() => setPaymentMethod('credit-card')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'credit-card'
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'credit-card' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`font-semibold ${paymentMethod === 'credit-card' ? 'text-primary' : 'text-gray-600'}`}>
                    Credit Card
                  </span>
                  <span className="text-xs text-gray-500">Visa, Mastercard</span>
                </div>
              </button>
            </div>

            {/* Show balance warning if using credits and insufficient */}
            {paymentMethod === 'credits' && !hasEnoughCredits && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Insufficient credits. You need {(totalCost - creditsBalance).toLocaleString()} more credits.
                </p>
              </div>
            )}

            {/* Show remaining balance if using credits */}
            {paymentMethod === 'credits' && hasEnoughCredits && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">After Purchase</span>
                  <span className="text-base font-bold text-blue-600">{remainingCredits.toLocaleString()} Credits</span>
                </div>
              </div>
            )}

            {/* Credit Card Form (only show if credit card selected) */}
            {paymentMethod === 'credit-card' && (
              <div className="mb-6">
                <PaymentForm
                  cardNumber={cardNumber}
                  setCardNumber={setCardNumber}
                  cardholderName={cardholderName}
                  setCardholderName={setCardholderName}
                  expirationDate={expirationDate}
                  setExpirationDate={setExpirationDate}
                  securityCode={securityCode}
                  setSecurityCode={setSecurityCode}
                />
              </div>
            )}

            {/* Wallet Address Input (Required for all payments) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MetaMask Wallet Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... (Enter your MetaMask wallet address)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                📍 Tokens will be sent to this wallet address on Base Sepolia network
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 rounded-xl bg-white border-t border-gray-200 p-6">
          <button
            onClick={handlePayNow}
            disabled={!isFormValid() || isLoading}
            className={`w-full font-semibold py-4 px-6 rounded-full transition-all shadow-lg flex items-center justify-center gap-2 ${
              !isFormValid() || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 hover:shadow-xl cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 text-white animate-spin" />
                <span className="text-white">Processing...</span>
              </>
            ) : (
              <span className="text-white">
                {paymentMethod === 'credits' ? 'Pay with Credits' : 'Pay with Card'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

export default InvestOrderSummaryDialog
