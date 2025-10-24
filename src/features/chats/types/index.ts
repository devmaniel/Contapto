export interface Participant {
  id: string
  phone: string
  displayName?: string
  avatarUrl?: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  timestamp: Date
  status: 'loading' | 'sent' | 'delivered' | 'read' | 'error'
  errorMessage?: string
}

export interface Chat {
  id: string
  participantId: string
  messages: Message[]
}

export interface ChatPreview {
  chatId: string
  participantId: string
  phoneOrName: string
  lastMessageText: string
  lastMessageTime: Date
  unreadCount: number
  lastMessageStatus?: 'loading' | 'sent' | 'delivered' | 'read' | 'error'
}
