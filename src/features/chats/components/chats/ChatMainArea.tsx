import { useState, useRef, useEffect } from 'react'
import { Phone, MoreVertical } from 'lucide-react'
import { BiSolidSend } from "react-icons/bi"
import { FaCircleUser } from 'react-icons/fa6'
import EmptyChatArea from './EmptyChatArea'
import MessageBubble from './MessageBubble'
import type { Message } from '../../types'

interface ChatMainAreaProps {
  messages?: Message[]
  participantName?: string
  participantPhone?: string
  hasChats?: boolean
  isSelected?: boolean
  onSendMessage?: (message: string) => void
  onInitiateCall?: (receiverPhone: string) => void
  currentUserId?: string
  hasCallPromo?: boolean
}

const ChatMainArea = ({ 
  messages, 
  participantName, 
  participantPhone,
  hasChats = false,
  isSelected = false,
  onSendMessage, 
  onInitiateCall,
  currentUserId,
  hasCallPromo = false
}: ChatMainAreaProps) => {
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasActiveChat = isSelected

  // Scroll to bottom smoothly when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageText.trim() || !onSendMessage) return
    onSendMessage(messageText.trim())
    setMessageText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInitiateCall = () => {
    if (!participantPhone || !onInitiateCall) {
      console.warn('Cannot initiate call: missing phone number or handler')
      return
    }
    console.log('📞 Initiating call to:', participantPhone)
    onInitiateCall(participantPhone)
  }

  if (!hasActiveChat) {
    return (
      <div className="flex-1 bg-white rounded-2xl shadow-lg flex items-center justify-center">
        <EmptyChatArea hasChats={hasChats} />
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <FaCircleUser className="w-7 h-7 text-gray-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{participantName || '+63xxxxxxxxxx'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInitiateCall}
            disabled={!hasCallPromo}
            className={`p-2 rounded-lg transition-colors ${
              hasCallPromo 
                ? 'cursor-pointer hover:bg-gray-100' 
                : 'cursor-not-allowed opacity-50'
            }`}
            title={hasCallPromo ? 'Start call' : 'No active call promo'}
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 cursor-pointer rounded-lg transition-colors hover:bg-gray-100">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {/* Invisible div at the bottom for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-5 py-3">
          <input
            type="text"
            placeholder="Text Message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm focus:outline-none bg-transparent py-1"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="cursor-pointer bg-primary text-white p-3 rounded-full hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center justify-center"
          >
            <BiSolidSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatMainArea
