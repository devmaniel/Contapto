import { Edit, MessageSquare } from 'lucide-react'

interface EmptyChatAreaProps {
  hasChats?: boolean
}

const EmptyChatArea = ({ hasChats = false }: EmptyChatAreaProps) => {
  if (hasChats) {
    // User has chats but none selected
    return (
      <div className="text-center">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
        </div>
        {/* Message */}
        <p className="text-lg font-semibold text-gray-900 mb-2">
          Select a Chat to Read Messages
        </p>
        <p className="text-sm text-gray-500">
          Choose a conversation from the list to view messages
        </p>
      </div>
    )
  }

  // User has no chats yet
  return (
    <div className="text-center">
      {/* Emoji */}
      <div className="mb-4 flex justify-center">
        <div className="text-7xl">😊</div>
      </div>
      {/* Message */}
      <p className="text-lg text-gray-900">
        Click the{' '}
        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary rounded text-white mx-1">
          <Edit className="w-4 h-4" />
        </span>{' '}
        to Start Conversation
      </p>
    </div>
  )
}

export default EmptyChatArea
