import React from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface PurchaseSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  tokensPurchased: number
  amountPaid: number
  newBalance: number
}

const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
  isOpen,
  onClose,
  transactionId,
  tokensPurchased,
  amountPaid,
  newBalance
}) => {
  if (!isOpen) return null

  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(transactionId)
    // You could add a toast notification here
  }

  const handleViewTransaction = () => {
    // In a real app, this would open a blockchain explorer or transaction details
    console.log('View transaction:', transactionId)
  }

  const dialogContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Purchase Successful!
          </h3>
          <p className="text-gray-600">
            You have successfully purchased AppToken
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Transaction Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tokens Purchased:</span>
              <span className="font-semibold">{tokensPurchased.toFixed(4)} AP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Credits Spent:</span>
              <span className="font-semibold">{amountPaid.toLocaleString()} Credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Credits Balance:</span>
              <span className="font-semibold">{newBalance.toLocaleString()} Credits</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                  {transactionId.slice(0, 8)}...
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTransactionId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={handleViewTransaction}
            className="flex-1 bg-primary"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Transaction
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}

export default PurchaseSuccessDialog
