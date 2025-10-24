import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader } from 'lucide-react'
import PaymentForm from './PaymentForm'
import PurchaseSuccessDialog from './PurchaseSuccessDialog'
import { validatePaymentForm } from '../utils/paymentValidation'
import { formatPhoneNumber } from '../utils/phoneFormatter'
import { useBuyCredits } from '../hooks/useBuyCredits'

interface OrderSummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  pesos: number
  credits: number
  userAccount?: string
}

const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = ({
  isOpen,
  onClose,
  pesos,
  credits,
  userAccount
}) => {
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
  } | null>(null)
  
  // Use the buy credits hook
  const { buyCredits, loading: isLoading } = useBuyCredits()

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset all state when dialog opens
      setIsSuccess(false)
      setWalletAddress('')
      setTransactionResult(null)
    }
  }, [isOpen])

  // Handle dialog close with state reset
  const handleClose = () => {
    setIsSuccess(false)
    setWalletAddress('')
    setTransactionResult(null)
    onClose()
  }

  if (!isOpen) return null

  const isFormValid = () => {
    return validatePaymentForm(cardNumber, cardholderName, expirationDate, securityCode) && walletAddress.trim().length > 0
  }

  const handlePayNow = async () => {
    if (!isFormValid()) {
      alert('Please fill in all fields correctly')
      return
    }

    // Prepare payment details
    const paymentDetails = {
      cardNumber,
      cardholderName,
      expirationDate,
      securityCode,
      walletAddress,
    }

    // Call the buy credits hook
    const result = await buyCredits({
      pesos,
      credits,
      paymentMethod: 'credit-card',
      paymentDetails,
    })

    if (result.success) {
      setTransactionResult(result)
      setIsSuccess(true)
    } else {
      alert('Payment failed. Please try again.')
    }
  }

  // Show success dialog
  if (isSuccess) {
    return (
      <PurchaseSuccessDialog
        isOpen={isSuccess}
        onClose={handleClose}
        pesos={pesos}
        credits={credits}
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
          {/* Account */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <span className="text-base font-semibold text-gray-800">Account</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🇵🇭</span>
              <span className="font-medium text-gray-800">{formatPhoneNumber(userAccount)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800">Total</span>
              <span className="text-lg font-bold text-gray-800">${pesos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{credits} Credits</span>
              <span className="text-base font-semibold text-gray-800">${pesos}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-gray-800">Payment Details</span>
            </div>

            {/* Credit Card Form */}
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

            {/* Wallet Address Input (Required) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Wallet Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... (Enter your wallet address)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                📍 Credits will be sent to this wallet address as proof of purchase
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
              <span className="text-white">Pay Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

export default OrderSummaryDialog
