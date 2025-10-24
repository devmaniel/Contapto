import React from 'react'
import { Wallet } from 'lucide-react'

interface WalletBalanceProps {
  balance: string
  balanceInCurrency: string
  currencySymbol?: string
  selectedCurrency?: string
}

const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  balanceInCurrency,
  currencySymbol = '₱',
  selectedCurrency = 'PHP',
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-4 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-blue-500 rounded-lg p-1.5">
          <Wallet className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">Your Wallet</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium text-gray-600">Credits Balance</span>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{balance}</p>
          </div>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-blue-100">
          <span className="text-xs font-medium text-gray-600">Available Credits</span>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{balanceInCurrency}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletBalance
