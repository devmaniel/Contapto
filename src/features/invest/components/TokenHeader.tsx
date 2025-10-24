import React from 'react'
import { ArrowUpRight } from 'lucide-react'

interface TokenHeaderProps {
  tokenName: string
  tokenSymbol: string
  currentPrice: string
  priceChange: string
  priceChangePercent: string
  selectedCurrency?: string
  currencySymbol?: string
  availableCurrencies?: string[]
  onCurrencyChange?: (currency: string) => void
}

const TokenHeader: React.FC<TokenHeaderProps> = ({
  tokenName,
  tokenSymbol,
  currentPrice,
  priceChange,
  priceChangePercent,
  selectedCurrency = 'PHP',
  currencySymbol = '₱',
  availableCurrencies = ['PHP'],
  onCurrencyChange,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">{tokenSymbol}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tokenName}</h1>
          <span className="text-sm text-gray-500">{tokenSymbol}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl font-bold text-gray-900">{currentPrice}</span>
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
          <ArrowUpRight className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-semibold text-sm">{priceChangePercent}</span>
        </div>
        <select
          value={selectedCurrency}
          onChange={(e) => onCurrencyChange?.(e.target.value)}
          className="ml-2 px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all bg-white"
        >
          {availableCurrencies.map((curr) => (
            <option key={curr} value={curr}>
              {curr === 'PHP' && '₱'}
              {curr === 'USD' && '$'}
              {curr === 'EUR' && '€'}
              {curr === 'GBP' && '£'}
              {curr === 'JPY' && '¥'}
              {curr === 'CNY' && '¥'}
              {curr === 'KRW' && '₩'}
              {' '}{curr}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default TokenHeader
