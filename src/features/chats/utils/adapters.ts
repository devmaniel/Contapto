import type { Message as SupabaseMessage, Profile } from '@/supabase/types'
import type { Message as UIMessage, ChatPreview, Participant } from '../types'
import type { ConversationWithDetails } from '../hooks/useConversations'
import { formatPhoneForDisplay } from './phoneUtils'

/**
 * Convert Supabase message to UI message format
 */
export function supabaseMessageToUIMessage(
  supabaseMsg: SupabaseMessage,
  currentUserId: string
): UIMessage {
  return {
    id: supabaseMsg.id,
    chatId: supabaseMsg.conversation_id,
    senderId: supabaseMsg.sender_id,
    text: supabaseMsg.message_item,
    timestamp: new Date(supabaseMsg.date),
    // Determine status based on sender and read status
    status: supabaseMsg.sender_id === currentUserId
      ? (supabaseMsg.is_read ? 'read' : 'sent')
      : (supabaseMsg.is_read ? 'read' : 'delivered')
  }
}

/**
 * Convert Supabase profile to UI participant format
 */
export function supabaseProfileToParticipant(profile: Profile): Participant {
  return {
    id: profile.id,
    phone: profile.phone,
    displayName: profile.display_name || undefined,
    avatarUrl: profile.avatar_url || undefined
  }
}

/**
 * Convert conversation with details to chat preview
 */
export function conversationToChatPreview(
  conversation: ConversationWithDetails,
  currentUserId: string
): ChatPreview {
  const lastMessage = conversation.last_message
  const otherUser = conversation.other_user

  // Format phone to always show +63 prefix
  const displayPhone = otherUser?.phone ? formatPhoneForDisplay(otherUser.phone) : 'Unknown'

  return {
    chatId: conversation.id,
    participantId: otherUser?.id || '',
    phoneOrName: otherUser?.display_name || displayPhone,
    lastMessageText: lastMessage?.message_item || 'No messages',
    lastMessageTime: lastMessage ? new Date(lastMessage.date) : new Date(conversation.created_at),
    unreadCount: conversation.unread_count,
    lastMessageStatus: lastMessage
      ? (lastMessage.sender_id === currentUserId
          ? (lastMessage.is_read ? 'read' : 'sent')
          : (lastMessage.is_read ? 'read' : 'delivered'))
      : undefined
  }
}
