import { useState } from 'react'
import { BiSolidSend } from "react-icons/bi"
import { X } from 'lucide-react'
import { FaCircleUser } from 'react-icons/fa6'

interface NewChatAreaProps {
  phoneNumber: string
  onPhoneNumberChange: (value: string) => void
  onCancel: () => void
  isPhoneValid: boolean
  onSendMessage: (message: string) => void
}

const NewChatArea = ({ phoneNumber, onPhoneNumberChange, onCancel, isPhoneValid, onSendMessage }: NewChatAreaProps) => {
  const [messageText, setMessageText] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get only digits from input
    let digits = e.target.value.replace(/\D/g, "")

    // Convert 09 to 9
    if (digits.startsWith("09")) {
      digits = digits.slice(1)
    }

    // Limit to 10 digits
    if (digits.length > 10) {
      digits = digits.slice(0, 10)
    }

    // Format as +63 + digits for the form value
    const formatted = digits ? `+63${digits}` : ""
    
    onPhoneNumberChange(formatted)
  }

  // Extract digits from phoneNumber for display (remove +63 prefix)
  let displayValue = ""
  if (phoneNumber) {
    if (phoneNumber.startsWith("+63")) {
      displayValue = phoneNumber.slice(3)
    } else if (phoneNumber.startsWith("63")) {
      displayValue = phoneNumber.slice(2)
    } else {
      displayValue = phoneNumber
    }
  }

  const handleSendMessage = () => {
    console.log('NewChatArea handleSendMessage called', { isPhoneValid, messageText, phoneNumber })
    if (!isPhoneValid || !messageText.trim()) {
      console.log('NewChatArea validation failed')
      return
    }
    
    console.log('NewChatArea calling onSendMessage with:', messageText.trim())
    onSendMessage(messageText.trim())
    setMessageText('') // Clear input after sending
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col">
      {/* Chat Header with Phone Input */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <FaCircleUser className="w-7 h-7 text-gray-500" />
          </div>
          <div className="relative flex-1">
            <input
              type="tel"
              value={displayValue}
              onChange={handleInputChange}
              placeholder="9xxxxxxxxx"
              maxLength={10}
              className={`w-full text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary pl-16 pr-2 py-1 rounded ${
                phoneNumber && !isPhoneValid ? 'text-red-600 ring-2 ring-red-300' : 'text-gray-900'
              }`}
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-700 font-semibold pointer-events-none">
              <span>🇵🇭</span>
              <span>+63</span>
            </span>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 cursor-pointer rounded-lg transition-colors hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages Area - Empty for new chat */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500 max-w-md">
          <p className="text-sm">
            {phoneNumber && !isPhoneValid 
              ? '⚠️ Invalid phone number format. Enter 10 digits starting with 9'
              : 'Enter a valid Philippine phone number to start messaging'}
          </p>
          <p className="text-xs mt-3 text-gray-400">
            💡 Tip: Just type 9xxxxxxxxx (10 digits)<br/>
            The +63 prefix is automatically added
          </p>
          {/* Debug info */}
          <p className="text-xs mt-2 text-gray-400">
            Phone: {phoneNumber || 'empty'} | Valid: {isPhoneValid ? '✓' : '✗'}
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center gap-3 bg-white border border-gray-300 rounded-full px-5 py-3 ${!isPhoneValid ? 'opacity-60' : ''}`}>
          <input
            type="text"
            placeholder="Text Message"
            disabled={!isPhoneValid}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-sm focus:outline-none bg-transparent py-1 disabled:cursor-not-allowed"
          />
          <button 
            disabled={!isPhoneValid || !messageText.trim()} 
            onClick={handleSendMessage}
            className="cursor-pointer bg-primary text-white p-3 rounded-full hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center justify-center"
          >
            <BiSolidSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewChatArea
