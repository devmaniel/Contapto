import { cn } from "@/lib/utils";
import { FaRegUserCircle } from "react-icons/fa";

interface MessageInboxCardProps extends React.ComponentProps<"div"> {
  senderNumber: string;
  timestamp?: string;
  unreadIndicator: number;
  messageContent?: string;
  activeState: boolean
  onClick?: () => void;
}

export function MessageInboxCard({
  className,
  senderNumber,
  timestamp,
  unreadIndicator,
  messageContent,
  activeState,
  onClick,
  ...props
}: MessageInboxCardProps) {
  return (
    <div 
        className={cn(
          "flex relative items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100",
          activeState && "border-2 border-slate-700 rounded-lg",
          className
        )}
      onClick={onClick}
      {...props}
    >
      {/* Profile Icon */}
      <FaRegUserCircle size={25}/>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {senderNumber}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {timestamp}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 w-[90%]">
          {messageContent}
        </p>
      </div>
      
      {/* Unread Indicator */}
      {unreadIndicator > 0 && (
        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 absolute bottom-2 right-2">
          <span className="text-xs text-white font-medium">
            {unreadIndicator}
          </span>
        </div>
      )}
    </div>
  )
}