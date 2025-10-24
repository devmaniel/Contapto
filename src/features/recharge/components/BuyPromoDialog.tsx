import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader, AlertCircle } from 'lucide-react'
import { MdToken } from 'react-icons/md'
import { formatPhoneNumber } from '../utils/phoneFormatter'
import { purchasePromo } from '../api/supabasePromos'
import { parsePromoDetails, calculateExpirationDate } from '../utils/promoParser'
import { useCreditsStore } from '@/shared/stores/useCreditsStore'
import { useActivePromos } from '../hooks/useActivePromos'

interface BuyPromoDialogProps {
  isOpen: boolean
  onClose: () => void
  promoId: string
  promoName: string
  promoDescription: string
  requiredCredits: number
  currentCredits: number
  userAccount?: string
  userId?: string
}

const BuyPromoDialog: React.FC<BuyPromoDialogProps> = ({
  isOpen,
  onClose,
  promoId,
  promoName,
  promoDescription,
  requiredCredits,
  currentCredits,
  userAccount,
  userId
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const setCredits = useCreditsStore((state) => state.setCredits)
  const { refetch: refetchPromos } = useActivePromos()

  if (!isOpen) return null

  const hasEnoughCredits = currentCredits >= requiredCredits
  const remainingCredits = currentCredits - requiredCredits

  const handleBuyNow = async () => {
    if (!hasEnoughCredits || !userId) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    
    try {
      console.log('🎁 Starting promo purchase:', { promoId, promoName, requiredCredits })
      
      // Parse promo details
      const parsed = parsePromoDetails(promoId, promoDescription)
      const expiresAt = calculateExpirationDate(parsed.durationDays)
      
      // Purchase promo
      const result = await purchasePromo({
        userId,
        promoId,
        promoName,
        promoType: parsed.promoType,
        textAllowance: parsed.textAllowance,
        callAllowance: parsed.callAllowance,
        creditsCost: requiredCredits,
        expiresAt
      })
      
      if (result.success) {
        console.log('✅ Promo purchased successfully')
        setIsSuccess(true)
        
        // Update Zustand store with new balance
        if (result.remainingCredits !== undefined) {
          setCredits(result.remainingCredits)
          console.log('💳 Credits updated:', result.remainingCredits)
        }
        
        // Refetch promos to update navbar
        await refetchPromos()
        console.log('🎁 Promos refetched for navbar update')
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose()
          setIsSuccess(false)
        }, 2000)
      } else {
        console.error('❌ Promo purchase failed:', result.error)
        setErrorMessage(result.error || 'Purchase failed. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error purchasing promo:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const dialogContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Buy Promo</h2>
            <p className="text-sm text-green-600 mt-1">Your info is private and secure</p>
          </div>
          <button
            onClick={onClose}
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

          {/* Promo Details */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{promoName}</h3>
            <p className="text-sm text-gray-600 mb-4">{promoDescription}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-2xl font-bold text-primary">{requiredCredits} Credits</span>
              <MdToken className="text-primary text-2xl" />
            </div>
          </div>

          {/* Credits Balance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-base font-semibold text-gray-800">Current Balance</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800">{currentCredits} Credits</span>
                <MdToken className="text-gray-800 text-xl" />
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-base font-semibold text-gray-800">Promo Cost</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">-{requiredCredits} Credits</span>
                <MdToken className="text-red-600 text-xl" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-base font-semibold text-gray-800">After Purchase</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`}>
                  {hasEnoughCredits ? remainingCredits : currentCredits} Credits
                </span>
                <MdToken className={hasEnoughCredits ? 'text-green-600' : 'text-red-600'} />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 mb-1">Purchase Failed</h4>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Insufficient Balance Warning */}
          {!hasEnoughCredits && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 mb-1">Insufficient Credits Balance</h4>
                <p className="text-sm text-red-700">
                  You need <span className="font-bold">{requiredCredits - currentCredits} more credits</span> to purchase this promo.
                  Please buy more credits first.
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-bold text-green-800 mb-1">Purchase Successful!</h4>
                <p className="text-sm text-green-700">
                  Your promo <span className="font-bold">{promoName}</span> has been activated.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 rounded-xl bg-white border-t border-gray-200 p-6">
          <button
            onClick={handleBuyNow}
            disabled={!hasEnoughCredits || isLoading || isSuccess}
            className={`w-full font-semibold py-4 px-6 rounded-full transition-all shadow-lg flex items-center justify-center gap-2 ${
              !hasEnoughCredits || isLoading || isSuccess
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 hover:shadow-xl cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 text-white animate-spin" />
                <span className="text-white">Processing...</span>
              </>
            ) : isSuccess ? (
              <span className="text-white">Purchase Complete!</span>
            ) : !hasEnoughCredits ? (
              <span className="text-white">Not Enough Credits</span>
            ) : (
              <span className="text-white">Buy Now</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

export default BuyPromoDialog
