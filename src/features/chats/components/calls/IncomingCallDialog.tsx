import React, { useState } from 'react'
import { FaPhoneAlt } from 'react-icons/fa'
import { MdCall } from 'react-icons/md'
import { FaCircleUser } from 'react-icons/fa6'

interface IncomingCallDialogProps {
  callerName?: string
  callerPhone?: string
  onAnswer?: () => void
  onDecline?: () => void
}

const IncomingCallDialog: React.FC<IncomingCallDialogProps> = ({
  callerName,
  callerPhone = '+63xxxxxxxxxx',
  onAnswer,
  onDecline
}) => {
  const [isClosing, setIsClosing] = useState(false)

  const handleDecline = () => {
    setIsClosing(true)
    // Wait for animation to complete before calling onDecline
    setTimeout(() => {
      onDecline?.()
    }, 300)
  }

  const handleAnswer = () => {
    setIsClosing(true)
    // Wait for animation to complete before calling onAnswer
    setTimeout(() => {
      onAnswer?.()
    }, 300)
  }

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      isClosing 
        ? 'opacity-0 scale-95 -translate-y-4' 
        : 'opacity-100 scale-100 translate-y-0'
    }`}>
      {/* Glassmorphic container */}
      <div className="relative">
        {/* Glass effect with black background */}
        <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl px-6 py-5 min-w-[600px]">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white/30">
                <FaCircleUser className="w-9 h-9 text-white" />
              </div>
            </div>

            {/* Caller phone */}
            <div className="flex-shrink-0">
              <p className="text-white font-medium text-lg">
                {callerName || callerPhone}
              </p>
            </div>

            {/* Horizontal divider line */}
            <div className="flex-1 h-[1px] bg-white/30"></div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Decline button - Red */}
              <button
                onClick={handleDecline}
                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer"
                aria-label="Decline call"
              >
                <FaPhoneAlt className="w-4 h-4 text-white rotate-135" />
              </button>

              {/* Answer button - Blue */}
              <button
                onClick={handleAnswer}
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer"
                aria-label="Answer call"
              >
                <MdCall className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/10 to-red-500/10 blur-xl rounded-2xl" />
      </div>
    </div>
  )
}

export default IncomingCallDialog