const ChatMainAreaSkeleton = () => {
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          {/* Name skeleton */}
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          {/* Action buttons skeleton */}
          <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
          <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 overflow-hidden p-4 bg-gray-50">
        <div className="space-y-4">
          {/* Left message skeleton */}
          <div className="flex items-start">
            <div className="max-w-[70%]">
              <div className="h-16 w-64 bg-gray-200 rounded-2xl rounded-bl-sm"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>

          {/* Right message skeleton */}
          <div className="flex items-end justify-end">
            <div className="max-w-[70%]">
              <div className="h-20 w-72 bg-gray-300 rounded-2xl rounded-br-sm"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-1 ml-auto"></div>
            </div>
          </div>

          {/* Left message skeleton */}
          <div className="flex items-start">
            <div className="max-w-[70%]">
              <div className="h-12 w-48 bg-gray-200 rounded-2xl rounded-bl-sm"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>

          {/* Right message skeleton */}
          <div className="flex items-end justify-end">
            <div className="max-w-[70%]">
              <div className="h-16 w-56 bg-gray-300 rounded-2xl rounded-br-sm"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-1 ml-auto"></div>
            </div>
          </div>

          {/* Left message skeleton */}
          <div className="flex items-start">
            <div className="max-w-[70%]">
              <div className="h-14 w-60 bg-gray-200 rounded-2xl rounded-bl-sm"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-full px-5 py-3">
          <div className="flex-1 h-5 bg-gray-200 rounded"></div>
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export default ChatMainAreaSkeleton
