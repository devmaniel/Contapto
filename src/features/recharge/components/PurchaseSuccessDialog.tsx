import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ExternalLink, Copy } from 'lucide-react';
import { formatPhoneNumber } from '../utils/phoneFormatter';

interface PurchaseSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  pesos: number
  credits: number
  userAccount?: string
  transactionResult?: {
    transactionId?: string
    blockchainTxHash?: string
    blockNumber?: number
    walletAddress?: string
  } | null
}

const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
  isOpen,
  onClose,
  pesos,
  credits,
  userAccount,
  transactionResult
}) => {
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})

  if (!isOpen) return null

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('❌ Failed to copy. Please try again or copy manually.')
    }
  }

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`
  }

  const dialogContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Purchase Completed!</h2>
          <p className="text-sm text-gray-600 mb-8">Your transaction has been recorded</p>
          
          <div className="space-y-4 text-left">
            {/* Account */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-base font-semibold text-gray-800">Account</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🇵🇭</span>
                <span className="font-medium text-gray-800">{formatPhoneNumber(userAccount)}</span>
              </div>
            </div>
            
            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800">Amount Paid</span>
              <span className="text-lg font-bold text-green-600">${pesos}</span>
            </div>
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-600">Credits Purchased</span>
              <span className="text-base font-semibold text-gray-800">{credits} Credits</span>
            </div>

            {/* Transaction Details */}
            {transactionResult && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">📋 Transaction Details</h3>
                
                {/* Wallet Address */}
                {transactionResult.walletAddress && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Wallet Address</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 flex-1 truncate">
                        {transactionResult.walletAddress}
                      </code>
                      <button
                        onClick={() => transactionResult.walletAddress && copyToClipboard(transactionResult.walletAddress, 'wallet')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy wallet address"
                      >
                        {copiedItems.wallet ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Transaction Hash */}
                {transactionResult.blockchainTxHash && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Transaction Hash</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 flex-1">
                        {truncateHash(transactionResult.blockchainTxHash)}
                      </code>
                      <button
                        onClick={() => transactionResult.blockchainTxHash && copyToClipboard(transactionResult.blockchainTxHash, 'txHash')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy transaction hash"
                      >
                        {copiedItems.txHash ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                      </button>
                      <a
                        href={`https://sepolia.basescan.org/tx/${transactionResult.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="View on BaseScan"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Block Number */}
                {transactionResult.blockNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Block Number</span>
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200">
                      #{transactionResult.blockNumber}
                    </span>
                  </div>
                )}

                {/* Transaction ID */}
                {transactionResult.transactionId && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Transaction ID</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 block truncate">
                      {transactionResult.transactionId}
                    </code>
                  </div>
                )}
              </div>
            )}

            {/* Info Note - Show different message based on transaction type */}
            {transactionResult?.blockchainTxHash && (
              <>
                {transactionResult.blockchainTxHash.length === 66 ? (
                  // Real blockchain transaction
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-4">
                    <p className="text-xs text-green-800">
                      ✅ <strong>Blockchain Confirmed:</strong> Your {credits} credits have been minted to wallet <code className="bg-green-100 px-1 rounded">{transactionResult?.walletAddress}</code> on Base Sepolia blockchain. You can verify this transaction on BaseScan.
                    </p>
                  </div>
                ) : (
                  // Pending/dummy transaction
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-4">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Pending Transfer:</strong> This transaction hash is for record-keeping. Admin will manually transfer {credits} credits to your wallet address <code className="bg-yellow-100 px-1 rounded">{transactionResult?.walletAddress}</code> using the smart contract.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => transactionResult.blockchainTxHash && copyToClipboard(transactionResult.blockchainTxHash, 'txHashBtn')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedItems.txHashBtn ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span>Copy Transaction Hash</span>
                  </button>
                  
                  {transactionResult.blockchainTxHash.length === 66 && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${transactionResult.blockchainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>View on BaseScan</span>
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

export default PurchaseSuccessDialog
