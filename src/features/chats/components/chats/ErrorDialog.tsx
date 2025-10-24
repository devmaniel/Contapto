import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface ErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  errorType: 'self-message' | 'user-not-found' | 'general'
  errorMessage?: string
}

const ErrorDialog = ({ isOpen, onClose, errorType, errorMessage }: ErrorDialogProps) => {
  const getErrorContent = () => {
    switch (errorType) {
      case 'self-message':
        return {
          title: 'Cannot Message Yourself',
          description: 'You cannot send messages to your own phone number. Please enter a different phone number to start a conversation.',
          icon: '🚫'
        }
      case 'user-not-found':
        return {
          title: 'User Not Found',
          description: 'No account exists with this phone number. Please check the number and try again, or ask them to create an account first.',
          icon: '❓'
        }
      case 'general':
      default:
        return {
          title: 'Error',
          description: errorMessage || 'An unexpected error occurred. Please try again.',
          icon: '⚠️'
        }
    }
  }

  const content = getErrorContent()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{content.icon}</span>
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        {errorType === 'user-not-found' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
            <p className="text-sm text-blue-900 font-medium mb-2">
              💡 Possible reasons:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Phone number is incorrect</li>
              <li>• User hasn't registered yet</li>
              <li>• Wrong country code (+63 for Philippines)</li>
            </ul>
          </div>
        )}

        <DialogFooter>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ErrorDialog
