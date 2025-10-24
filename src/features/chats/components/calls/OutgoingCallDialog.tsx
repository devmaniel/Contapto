import React, { useState, useEffect, useCallback } from 'react'
import { MdCallEnd } from 'react-icons/md'
import { FaRegCircleUser } from 'react-icons/fa6'

interface OutgoingCallDialogProps {
  receiverName?: string
  receiverPhone?: string
  onEndCall?: () => void
  callDuration?: number // seconds since call started
}

const OutgoingCallDialog: React.FC<OutgoingCallDialogProps> = ({
  receiverName,
  receiverPhone = '+63xxxxxxxxxx',
  onEndCall,
  callDuration = 0
}) => {
  const [isEnding, setIsEnding] = useState(false)
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)

  const handleEndCall = useCallback(() => {
    setIsEnding(true)
    // Wait for fade animation to complete
    setTimeout(() => {
      onEndCall?.()
    }, 500)
  }, [onEndCall])

  // Show timeout message after 60 seconds (1 minute)
  useEffect(() => {
    if (callDuration >= 60) {
      setShowTimeoutMessage(true)
      // Auto-end after showing timeout message for 2 seconds
      const timeout = setTimeout(() => {
        handleEndCall()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [callDuration, handleEndCall])

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${
      isEnding ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Avatar - Floating with pulse animation */}
      <div className={`mb-4 transition-all duration-300 ${
        isEnding ? 'scale-95 -translate-y-4' : 'scale-100'
      }`}>
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-blue-500 flex items-center justify-center shadow-2xl">
            <FaRegCircleUser className="w-20 h-20 text-white" />
          </div>
          {/* Pulsing rings animation - only show when calling */}
          {!showTimeoutMessage && (
            <>
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-pulse opacity-30"></div>
            </>
          )}
        </div>
      </div>

      {/* Phone number - Floating */}
      <div className={`mb-2 transition-all duration-300 ${
        isEnding ? 'scale-95 -translate-y-4' : 'scale-100'
      }`}>
        <p className="text-white font-bold text-2xl drop-shadow-lg">
          {receiverName || receiverPhone}
        </p>
      </div>

      {/* Calling status or timeout message - Floating */}
      <div className={`mb-16 transition-all duration-300 ${
        isEnding ? 'scale-95 -translate-y-4' : 'scale-100'
      }`}>
        {showTimeoutMessage ? (
          <p className="text-red-400 font-semibold text-lg animate-pulse drop-shadow-lg">
            No answer
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-white text-xl font-semibold drop-shadow-lg">
              Calling...
            </p>
            {/* Animated dots */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            {/* Duration counter */}
            <p className="text-white/70 text-sm font-mono mt-2">
              {callDuration}s
            </p>
          </div>
        )}
      </div>

      {/* End call button - Floating */}
      {!showTimeoutMessage && (
        <div className={`transition-all duration-300 ${
          isEnding ? 'scale-95 -translate-y-4' : 'scale-100'
        }`}>
          <button
            onClick={handleEndCall}
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-2xl shadow-red-500/50 cursor-pointer"
            aria-label="End call"
          >
            <MdCallEnd className="w-10 h-10 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}

export default OutgoingCallDialog
