const EmptyStateSkeleton = () => {
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg flex items-center justify-center">
      <div className="text-center animate-pulse-slow">
        {/* Icon skeleton */}
        <div className="mb-4 flex justify-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Title skeleton */}
        <div className="flex justify-center mb-2">
          <div className="h-6 w-64 bg-gray-200 rounded"></div>
        </div>
        
        {/* Subtitle skeleton */}
        <div className="flex justify-center">
          <div className="h-4 w-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default EmptyStateSkeleton
