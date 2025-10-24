import type { Message } from '../../types'
import { Loader } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  currentUserId?: string
}

const MessageBubble = ({ message, currentUserId }: MessageBubbleProps) => {
  const isMe = currentUserId ? message.senderId === currentUserId : false
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Determine bubble color based on status
  const getBubbleColor = () => {
    if (!isMe) return 'bg-gray-200 text-gray-900'
    if (message.status === 'loading') return 'bg-gray-400 text-white'
    if (message.status === 'error') return 'bg-gray-700 text-white'
    return 'bg-primary text-white'
  }

  const getTextColor = () => {
    if (!isMe) return 'text-gray-500'
    if (message.status === 'loading') return 'text-gray-100'
    if (message.status === 'error') return 'text-gray-300'
    return 'text-primary-foreground/80'
  }

  return (
    <div 
      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500`}
    >
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
        <div
          className={`max-w-[70%] px-4 py-2 rounded-2xl ${getBubbleColor()} ${
            isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
          } transition-all duration-300`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${getTextColor()}`}>
              {formatTime(message.timestamp)}
            </span>
            {isMe && message.status === 'loading' && (
              <Loader className="w-3 h-3 animate-spin" />
            )}
          </div>
        </div>
      </div>
      {isMe && message.status === 'error' && message.errorMessage && (
        <p className="text-xs text-red-500 mt-1 px-2 animate-in fade-in duration-300">
          {message.errorMessage}
        </p>
      )}
    </div>
  )
}

export default MessageBubble
