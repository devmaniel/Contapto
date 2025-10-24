import { Edit } from 'lucide-react'
import { TbMessageCircleFilled } from "react-icons/tb"
import SearchBar from './SearchBar'
import EmptyMessagesList from './EmptyMessagesList'
import ChatPreviewItem from './ChatPreviewItem'
import type { ChatPreview } from '../../types'

interface ChatSidebarProps {
  items: ChatPreview[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  onNewChat?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
}

const ChatSidebar = ({ 
  items,
  selectedChatId,
  onSelectChat,
  onNewChat, 
  searchValue, 
  onSearchChange 
}: ChatSidebarProps) => {
  return (
    <div className="w-[500px] bg-white rounded-2xl shadow-lg flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <TbMessageCircleFilled className='h-8 w-8 text-primary'/>
          <h2 className="text-2xl font-bold text-gray-900">Chats</h2>
        </div>

        {/* Search Bar and New Chat Button */}
        <div className="flex gap-2">
          <SearchBar 
            value={searchValue}
            onChange={onSearchChange}
          />
          <button 
            onClick={onNewChat}
            className="bg-primary text-white cursor-pointer p-2 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <EmptyMessagesList />
        ) : (
          items.map((preview) => (
            <ChatPreviewItem
              key={preview.chatId}
              preview={preview}
              isSelected={preview.chatId === selectedChatId}
              onClick={() => onSelectChat(preview.chatId)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ChatSidebar
