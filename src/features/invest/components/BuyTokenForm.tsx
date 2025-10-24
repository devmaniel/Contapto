import React from 'react'
import { Wallet, ArrowDownRight, Info } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface BuyTokenFormProps {
  priceInput: string
  tokenAmount: string
  estimatedTokens: string
  estimatedTotal: string
  convertedPrice?: number
  paymentCurrency: 'PHP' | 'Credits'
  onPaymentCurrencyChange: (currency: 'PHP' | 'Credits') => void
  onPriceChange: (value: string) => void
  onTokenAmountChange: (value: string) => void
  onBuy: () => void
  loading?: boolean
  error?: any
}

const BuyTokenForm: React.FC<BuyTokenFormProps> = ({
  priceInput,
  tokenAmount,
  estimatedTokens,
  estimatedTotal,
  convertedPrice = 75,
  paymentCurrency,
  onPaymentCurrencyChange,
  onPriceChange,
  onTokenAmountChange,
  onBuy,
  loading = false,
  error,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        Buy ContapToken
      </h3>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">
            {error.message || 'Purchase failed. Please try again.'}
          </p>
        </div>
      )}
      
      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">You Pay</label>
        <div className="relative group">
          <input
            type="text"
            value={priceInput}
            onChange={(e) => onPriceChange(e.target.value)}
            className="w-full px-4 py-4 pr-32 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-bold transition-all hover:border-gray-300"
            placeholder="0.00"
          />
          <select
            value={paymentCurrency}
            onChange={(e) => onPaymentCurrencyChange(e.target.value as 'PHP' | 'Credits')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PHP">PHP (₱)</option>
            <option value="Credits">Credits</option>
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          ≈ {estimatedTokens} AP tokens
          {paymentCurrency === 'PHP' && ` (${parseFloat(priceInput || '0').toFixed(0)} Credits)`}
          {paymentCurrency === 'Credits' && ` (₱${parseFloat(priceInput || '0').toLocaleString()})`}
        </p>
      </div>

      {/* Swap Icon */}
      <div className="flex justify-center -my-2 mb-2">
        <div className="bg-primary rounded-full p-2 shadow-md">
          <ArrowDownRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Token Amount Input */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">You Receive</label>
        <div className="relative group">
          <input
            type="text"
            value={tokenAmount}
            onChange={(e) => onTokenAmountChange(e.target.value)}
            className="w-full px-4 py-4 pr-16 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xl font-bold transition-all hover:border-gray-300"
            placeholder="0.0000"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">AP</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">≈ {estimatedTotal} {paymentCurrency} (₱{estimatedTotal} = {estimatedTotal} Credits)</p>
      </div>

      {/* Pricing Info */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-4 rounded-xl mb-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 rounded-lg p-1.5 mt-0.5">
            <Info className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-xs flex-1">
            <p className="font-bold text-gray-800 mb-2">Pricing & Payment</p>
            <div className="space-y-1.5 text-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Token Price</span>
                <span className="font-semibold">{convertedPrice.toFixed(0)} Credits = ₱{convertedPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversion</span>
                <span className="font-semibold">1 Credit = ₱1</span>
              </div>
              <div className="pt-2 border-t border-blue-200">
                <p className="text-gray-600 text-[10px] leading-relaxed">
                  💳 <span className="font-semibold">Pay with Credits</span> or <span className="font-semibold">Credit Card</span> (PHP)
                  <br />
                  <span className="text-gray-500">Choose payment method on next step</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <Button 
        onClick={onBuy}
        disabled={loading || !priceInput || !tokenAmount || parseFloat(priceInput) <= 0 || parseFloat(tokenAmount) <= 0}
        className="w-full bg-primary text-white font-bold h-14 mt-auto shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5 mr-2" />
            Buy Now
          </>
        )}
      </Button>
    </div>
  )
}

export default BuyTokenForm
