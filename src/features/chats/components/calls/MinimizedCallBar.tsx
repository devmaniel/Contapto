import React, { useState } from 'react'
import { FiMic, FiMicOff } from 'react-icons/fi'
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi'
import { MdCallEnd } from 'react-icons/md'
import { FaRegCircleUser } from 'react-icons/fa6'
import { MdFullscreen } from 'react-icons/md'

interface MinimizedCallBarProps {
  callerName?: string
  callerPhone?: string
  onEndCall?: () => void
  onMaximize?: () => void
  isMuted?: boolean
  isVolumeHigh?: boolean
  onToggleMute?: () => void
  onToggleVolume?: () => void
  timer?: number
}

const MinimizedCallBar: React.FC<MinimizedCallBarProps> = ({
  callerName,
  callerPhone = '+63xxxxxxxxxx',
  onEndCall,
  onMaximize,
  isMuted = false,
  isVolumeHigh = true,
  onToggleMute,
  onToggleVolume,
  timer = 0
}) => {
  const [isEnding, setIsEnding] = useState(false)
  const [showEndMessage, setShowEndMessage] = useState(false)

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setShowEndMessage(true)
    
    // Wait 2 seconds showing "Phone Call ended" then start fade out
    setTimeout(() => {
      setIsEnding(true)
      // Wait another 1 second for fade animation to complete
      setTimeout(() => {
        onEndCall?.()
      }, 1000)
    }, 2000)
  }

  return (
    <div 
      className={`w-full transition-all duration-1000 ${
        isEnding ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
      }`}
    >
      {/* Full width bar */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/20 shadow-2xl px-8 py-3">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            {/* Left side: Avatar and Caller info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <FaRegCircleUser className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Caller info */}
              <div className="flex items-center gap-3">
                <p className="text-white font-medium text-sm">
                  {callerName || callerPhone}
                </p>
                {showEndMessage ? (
                  <p className="text-red-400 font-medium text-sm animate-pulse">
                    Phone Call ended
                  </p>
                ) : (
                  <p className="text-white/60 text-sm font-mono">
                    {formatTime(timer)}
                  </p>
                )}
              </div>
            </div>

            {/* Right side: Control buttons */}
            {!showEndMessage && (
              <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mute/Unmute button */}
              <button
                onClick={onToggleMute}
                className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg cursor-pointer active:scale-95 ${
                  isMuted 
                    ? 'bg-gray-600 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-100'
                }`}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <FiMicOff className="w-5 h-5 text-white" />
                ) : (
                  <FiMic className="w-5 h-5 text-gray-800" />
                )}
              </button>

              {/* Volume button */}
              <button
                onClick={onToggleVolume}
                className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg cursor-pointer active:scale-95 ${
                  isVolumeHigh 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                aria-label={isVolumeHigh ? 'Lower volume' : 'Boost volume'}
              >
                {isVolumeHigh ? (
                  <HiVolumeUp className="w-6 h-6 text-white" />
                ) : (
                  <HiVolumeOff className="w-6 h-6 text-white" />
                )}
              </button>

              {/* End call button */}
              <button
                onClick={handleEndCall}
                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer"
                aria-label="End call"
              >
                <MdCallEnd className="w-5 h-5 text-white" />
              </button>

              {/* Maximize button */}
              <button
                onClick={onMaximize}
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-800 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg cursor-pointer"
                aria-label="Maximize"
              >
                <MdFullscreen className="w-6 h-6 text-white" />
              </button>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}

export default MinimizedCallBar
