import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, ExternalLink } from 'lucide-react'
import { formatPhoneNumber } from '../../recharge/utils/phoneFormatter'

interface InvestPurchaseSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  tokenSymbol: string
  tokenName: string
  tokenAmount: number
  totalCost: number
  paymentMethod: 'credits' | 'credit-card'
  userAccount?: string
  transactionResult: {
    transactionId?: string
    blockchainTxHash?: string
    blockNumber?: number
    walletAddress?: string
    newBalance?: number
  } | null
}

const InvestPurchaseSuccessDialog: React.FC<InvestPurchaseSuccessDialogProps> = ({
  isOpen,
  onClose,
  tokenSymbol,
  tokenName,
  tokenAmount,
  totalCost,
  paymentMethod,
  userAccount,
  transactionResult
}) => {
  if (!isOpen) return null

  const explorerUrl = transactionResult?.blockchainTxHash 
    ? `https://sepolia.basescan.org/tx/${transactionResult.blockchainTxHash}`
    : null

  const dialogContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Purchase Successful!</h2>
              <p className="text-sm text-green-600 mt-1">Your tokens are on the way</p>
            </div>
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
          {/* Success Message */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {tokenAmount} {tokenSymbol} Tokens Purchased!
              </h3>
              <p className="text-gray-600">
                Your {tokenName} tokens have been successfully purchased and will be sent to your wallet.
              </p>
            </div>
          </div>

          {/* Account */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <span className="text-base font-semibold text-gray-800">Account</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🇵🇭</span>
              <span className="font-medium text-gray-800">{formatPhoneNumber(userAccount)}</span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-800">Transaction Details</h4>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tokens Purchased</span>
                <span className="font-semibold text-gray-800">{tokenAmount} {tokenSymbol}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="font-semibold text-gray-800">{totalCost.toLocaleString()} Credits</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="font-semibold text-gray-800">
                  {paymentMethod === 'credits' ? '💳 Credits' : '💳 Credit Card'}
                </span>
              </div>

              {paymentMethod === 'credits' && transactionResult?.newBalance !== undefined && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">New Credits Balance</span>
                  <span className="font-bold text-blue-600">{transactionResult.newBalance.toLocaleString()} Credits</span>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Details */}
          {transactionResult?.blockchainTxHash && (
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-gray-800">Blockchain Details</h4>
              
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-gray-600">Wallet Address</span>
                  <span className="font-mono text-xs text-gray-800 break-all text-right">
                    {transactionResult.walletAddress}
                  </span>
                </div>
                
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-gray-600">Transaction Hash</span>
                  <span className="font-mono text-xs text-gray-800 break-all text-right">
                    {transactionResult.blockchainTxHash}
                  </span>
                </div>
                
                {transactionResult.blockNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Block Number</span>
                    <span className="font-semibold text-gray-800">#{transactionResult.blockNumber}</span>
                  </div>
                )}

                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-3"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on BaseScan
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Transaction ID */}
          {transactionResult?.transactionId && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transaction ID</span>
                <span className="font-mono text-xs text-gray-800">{transactionResult.transactionId}</span>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <h4 className="font-bold text-gray-800 mb-2">📌 Next Steps</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Check your MetaMask wallet to see your tokens</li>
              <li>• Tokens are on Base Sepolia testnet</li>
              <li>• Transaction is recorded on the blockchain</li>
              <li>• You can view the transaction on BaseScan</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 rounded-xl bg-white border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-full transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

export default InvestPurchaseSuccessDialog
