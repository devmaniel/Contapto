import React, { useState, useEffect, useCallback } from 'react'
import { FiMic, FiMicOff } from 'react-icons/fi'
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi'
import { MdCallEnd } from 'react-icons/md'
import { FaRegCircleUser } from 'react-icons/fa6'
import { MdMinimize } from 'react-icons/md'

interface ActiveCallDialogProps {
  callerName?: string
  callerPhone?: string
  isCallEnded?: boolean
  onEndCall?: () => void
  onMinimize?: () => void
  callDuration?: number
  remainingMinutes?: number | null // null = unlimited, number = remaining minutes
}

const ActiveCallDialog: React.FC<ActiveCallDialogProps> = ({
  callerName,
  callerPhone = '+63xxxxxxxxxx',
  isCallEnded = false,
  onEndCall,
  onMinimize,
  callDuration = 0,
  remainingMinutes = null
}) => {
  const [timer, setTimer] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVolumeHigh, setIsVolumeHigh] = useState(true)
  const [isEnding, setIsEnding] = useState(false)
  const [showEndMessage, setShowEndMessage] = useState(false)
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = useCallback(() => {
    // Prevent multiple calls
    if (showEndMessage) return
    
    // Call API immediately to notify other person (don't wait for animation)
    // This ensures both sides see the animation at the same time
    if (!isCallEnded) {
      onEndCall?.()
    }
    
    // Show end message
    setShowEndMessage(true)
    
    // Wait 2 seconds showing "Phone Call ended" then start fade out
    setTimeout(() => {
      setIsEnding(true)
    }, 2000)
  }, [onEndCall, isCallEnded, showEndMessage])

  // Use callDuration from props instead of internal timer
  useEffect(() => {
    setTimer(callDuration)
  }, [callDuration])

  // Check if call limit is reached
  useEffect(() => {
    if (remainingMinutes === null) {
      console.log('📊 Unlimited call - no auto-end')
      return
    }
    
    // Use Math.floor() during active call to avoid premature limit warnings
    // Only use Math.ceil() when actually deducting minutes at call end
    const usedMinutes = Math.floor(timer / 60)
    const minutesLeft = remainingMinutes - usedMinutes
    console.log('📊 ActiveCallDialog limit check:', { 
      remainingMinutes, 
      timer,
      timerSeconds: `${timer}s`,
      usedMinutes,
      minutesLeft,
      formula: `${remainingMinutes} (remaining) - ${usedMinutes} (used floor) = ${minutesLeft} (left)`
    })
    
    // GRACE PERIOD: Don't auto-end in first 5 seconds to prevent false positives
    if (timer < 5) {
      console.log('🛡️ Grace period active - no auto-end in first 5 seconds')
      return
    }
    
    // Show warning when 5 minutes or less remaining
    if (minutesLeft <= 5 && minutesLeft > 0 && !showLimitWarning) {
      console.log('⚠️ Showing limit warning:', minutesLeft, 'minutes left')
      setShowLimitWarning(true)
    }
    
    // Auto-end call when limit ACTUALLY reached (after grace period)
    // Only end when we've COMPLETED the minutes, not started them
    if (minutesLeft < 0 && !showEndMessage) {
      console.log('⚠️ Call promo limit reached - auto-ending call', { 
        remainingMinutes, 
        usedMinutes, 
        minutesLeft, 
        timer,
        timerSeconds: `${timer}s`
      })
      handleEndCall()
    }
  }, [timer, remainingMinutes, showLimitWarning, showEndMessage, handleEndCall])

  // Detect when call is ended by the other person
  useEffect(() => {
    if (isCallEnded && !showEndMessage) {
      console.log('📞 Call ended by other person - showing end message')
      handleEndCall()
    }
  }, [isCallEnded, showEndMessage, handleEndCall])

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVolume = () => {
    setIsVolumeHigh(!isVolumeHigh)
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-1000 ${
      isEnding ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Minimize button - Top right */}
      {!showEndMessage && (
        <button
          onClick={onMinimize}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-700/80 hover:bg-gray-600 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg cursor-pointer"
          aria-label="Minimize"
        >
          <MdMinimize className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Avatar - Floating */}
      <div className={`mb-4 transition-all duration-300 ${
        isEnding ? 'scale-95 -translate-y-4' : 'scale-100'
      }`}>
        <div className="w-28 h-28 rounded-full bg-blue-500 flex items-center justify-center shadow-2xl">
          <FaRegCircleUser className="w-20 h-20 text-white" />
        </div>
      </div>

      {/* Phone number - Floating */}
      <div className={`mb-2 transition-all duration-300 ${
        isEnding ? 'scale-95 -translate-y-4' : 'scale-100'
      }`}>
        <p className="text-white font-bold text-2xl drop-shadow-lg">
          {callerName || callerPhone}
        </p>
      </div>

      {/* Timer or End message - Floating */}
      <div className={`mb-8 transition-all duration-500 ${
        isEnding ? 'scale-95 -translate-y-4' : 'scale-100'
      }`}>
        <div className="relative flex flex-col items-center">
          {/* Timer - fades out */}
          <p className={`text-white text-3xl font-mono font-bold drop-shadow-lg transition-opacity duration-500 ${
            showEndMessage ? 'opacity-0 absolute' : 'opacity-100'
          }`}>
            {formatTime(timer)}
          </p>
          
          {/* Remaining time - shows below timer */}
          {!showEndMessage && remainingMinutes !== null && (
            <p className={`text-sm mt-2 drop-shadow-lg transition-colors ${
              showLimitWarning ? 'text-yellow-400 font-semibold animate-pulse' : 'text-gray-300'
            }`}>
              {remainingMinutes - Math.floor(timer / 60) > 0 
                ? `${remainingMinutes - Math.floor(timer / 60)} min left` 
                : 'Limit reached'}
            </p>
          )}
          
          {/* End message - fades in */}
          <p className={`text-red-400 font-semibold text-lg drop-shadow-lg transition-opacity duration-500 ${
            showEndMessage ? 'opacity-100 animate-pulse' : 'opacity-0 absolute'
          }`}>
            Phone Call ended
          </p>
        </div>
      </div>

      {/* Control buttons - Floating */}
      <div className={`flex items-center justify-center gap-6 transition-all duration-500 ${
        showEndMessage ? 'opacity-0 scale-95 -translate-y-4 pointer-events-none' : 'opacity-100 scale-100'
      }`}>
          {/* Mute/Unmute button */}
          <button
            onClick={toggleMute}
            className={`w-20 h-20 rounded-full transition-all duration-200 flex items-center justify-center shadow-2xl cursor-pointer active:scale-95 ${
              isMuted 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-white hover:bg-gray-100'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <FiMicOff className="w-9 h-9 text-white" />
            ) : (
              <FiMic className="w-9 h-9 text-gray-800" />
            )}
          </button>

          {/* Volume button */}
          <button
            onClick={toggleVolume}
            className={`w-20 h-20 rounded-full transition-all duration-200 flex items-center justify-center shadow-2xl cursor-pointer active:scale-95 ${
              isVolumeHigh 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            aria-label={isVolumeHigh ? 'Lower volume' : 'Boost volume'}
          >
            {isVolumeHigh ? (
              <HiVolumeUp className="w-10 h-10 text-white" />
            ) : (
              <HiVolumeOff className="w-10 h-10 text-white" />
            )}
          </button>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-2xl shadow-red-500/50 cursor-pointer"
            aria-label="End call"
          >
            <MdCallEnd className="w-10 h-10 text-white" />
          </button>
      </div>
    </div>
  )
}

export default ActiveCallDialog
