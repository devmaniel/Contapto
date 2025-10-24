import { XCircle, Loader } from 'lucide-react'
import { FaCircleUser } from 'react-icons/fa6'
import type { ChatPreview } from '../../types'

interface ChatPreviewItemProps {
  preview: ChatPreview
  isSelected?: boolean
  onClick: () => void
}

const ChatPreviewItem = ({ preview, isSelected, onClick }: ChatPreviewItemProps) => {
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    // Format as MM/DD/YYYY for older messages
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${
        isSelected ? 'bg-primary/10' : ''
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
        <FaCircleUser className="w-8 h-8 text-gray-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm truncate ${preview.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
            {preview.phoneOrName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {formatRelativeTime(preview.lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {preview.lastMessageStatus === 'error' && (
              <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            )}
            {preview.lastMessageStatus === 'loading' && (
              <Loader className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 animate-spin" />
            )}
            <p className={`text-sm truncate ${
              preview.lastMessageStatus === 'error' 
                ? 'text-red-600 font-medium' 
                : preview.unreadCount > 0 
                  ? 'font-bold text-gray-900' 
                  : 'text-gray-600'
            }`}>
              {preview.lastMessageText}
            </p>
          </div>
          {preview.unreadCount > 0 && (
            <span className="flex-shrink-0 bg-primary text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ml-2">
              {preview.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPreviewItem
