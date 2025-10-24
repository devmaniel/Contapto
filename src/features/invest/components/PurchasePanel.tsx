import React from 'react'
import BuyTokenForm from './BuyTokenForm'

interface PurchasePanelProps {
  priceInput: string
  tokenAmount: string
  estimatedTokens: string
  estimatedTotal: string
  selectedCurrency?: string
  currencySymbol?: string
  convertedPrice?: number
  paymentCurrency: 'PHP' | 'Credits'
  onPaymentCurrencyChange: (currency: 'PHP' | 'Credits') => void
  onPriceChange: (value: string) => void
  onTokenAmountChange: (value: string) => void
  onBuy: () => void
  loading?: boolean
  error?: { message: string; code: string } | null
}

const PurchasePanel: React.FC<PurchasePanelProps> = ({
  priceInput,
  tokenAmount,
  estimatedTokens,
  estimatedTotal,
  convertedPrice,
  paymentCurrency,
  onPaymentCurrencyChange,
  onPriceChange,
  onTokenAmountChange,
  onBuy,
  loading = false,
  error,
}) => {
  return (
    <div className="lg:col-span-1 flex">
      <div className="border border-gray-200 rounded-xl p-6 flex flex-col flex-1">
        <BuyTokenForm
          priceInput={priceInput}
          tokenAmount={tokenAmount}
          estimatedTokens={estimatedTokens}
          estimatedTotal={estimatedTotal}
          convertedPrice={convertedPrice}
          paymentCurrency={paymentCurrency}
          onPaymentCurrencyChange={onPaymentCurrencyChange}
          onPriceChange={onPriceChange}
          onTokenAmountChange={onTokenAmountChange}
          onBuy={onBuy}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}

export default PurchasePanel
