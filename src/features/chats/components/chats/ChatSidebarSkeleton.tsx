const ChatSidebarSkeleton = () => {
  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
        {/* Search bar skeleton */}
        <div className="h-10 bg-gray-200 rounded-full"></div>
      </div>

      {/* Chat list skeleton */}
      <div className="flex-1 overflow-hidden">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* Avatar skeleton */}
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              
              <div className="flex-1 min-w-0">
                {/* Name skeleton */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                {/* Message skeleton */}
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {/* Time skeleton */}
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                {/* Badge skeleton (optional) */}
                {item % 2 === 0 && (
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatSidebarSkeleton
