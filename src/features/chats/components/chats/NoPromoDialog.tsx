import { useNavigate } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface NoPromoDialogProps {
  isOpen: boolean
  onClose: () => void
  promoType: 'text' | 'call'
}

const NoPromoDialog = ({ isOpen, onClose, promoType }: NoPromoDialogProps) => {
  const navigate = useNavigate()

  const handleGoToRecharge = () => {
    onClose()
    navigate({ to: '/recharge' })
  }

  const title = promoType === 'text' ? 'No Text Promo Available' : 'No Call Promo Available'
  const description = promoType === 'text' 
    ? 'You need an active text promo to send messages. Purchase a promo to continue messaging.'
    : 'You need an active call promo to make calls. Purchase a promo to start calling.'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
          <p className="text-sm text-blue-900 font-medium mb-2">
            💡 Available Promos:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• Unlimited {promoType === 'text' ? 'messaging' : 'calls'}</li>
            <li>• Limited bundles with credits</li>
            <li>• Combo packages (text + calls)</li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGoToRecharge}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Recharge
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NoPromoDialog
