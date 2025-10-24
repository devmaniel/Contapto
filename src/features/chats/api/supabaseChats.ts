import { supabase } from '@/supabase/supabase-api'
import type { 
  Conversation, 
  Message, 
  Profile, 
  ConversationInsert, 
  MessageInsert 
} from '@/supabase/types'
import { getPhoneVariants } from '../utils/phoneUtils'

// ==================== CONVERSATIONS ====================

/**
 * Get or create a conversation between two users
 * Ensures consistent ordering of participant IDs to avoid duplicates
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<{ data: Conversation | null; error: Error | null }> {
  try {
    // Order participant IDs consistently (alphabetically) to avoid duplicate conversations
    const [participant1_id, participant2_id] = [userId1, userId2].sort()

    // First, try to find existing conversation
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant1_id.eq.${participant1_id},participant2_id.eq.${participant2_id}),and(participant1_id.eq.${participant2_id},participant2_id.eq.${participant1_id})`)
      .single()

    if (existingConversation) {
      return { data: existingConversation, error: null }
    }

    // If not found and error is not "no rows", return the error
    if (findError && findError.code !== 'PGRST116') {
      return { data: null, error: new Error(findError.message) }
    }

    // Create new conversation
    const newConversation: ConversationInsert = {
      participant1_id,
      participant2_id,
      updated_at: new Date().toISOString()
    }

    const { data: createdConversation, error: createError } = await supabase
      .from('conversations')
      .insert(newConversation)
      .select()
      .single()

    if (createError) {
      return { data: null, error: new Error(createError.message) }
    }

    return { data: createdConversation, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

/**
 * Get all conversations for a user with last message info
 */
export async function getUserConversations(userId: string): Promise<{
  data: Array<Conversation & { 
    other_user: Profile | null
    last_message: Message | null
    unread_count: number
  }> | null
  error: Error | null
}> {
  try {
    // Get all conversations where user is a participant
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('updated_at', { ascending: false })

    if (convError) {
      return { data: null, error: new Error(convError.message) }
    }

    if (!conversations || conversations.length === 0) {
      return { data: [], error: null }
    }

    // For each conversation, get the other user's profile and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Determine the other user's ID
        const otherUserId = conv.participant1_id === userId 
          ? conv.participant2_id 
          : conv.participant1_id

        // Get other user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single()

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        // Get unread count (messages sent by other user that current user hasn't read)
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('sender_id', otherUserId)
          .eq('is_read', false)

        return {
          ...conv,
          other_user: profile,
          last_message: lastMessage,
          unread_count: unreadCount || 0
        }
      })
    )

    return { data: conversationsWithDetails, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

/**
 * Update conversation's updated_at timestamp
 */
export async function updateConversationTimestamp(
  conversationId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    return { 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

// ==================== MESSAGES ====================

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string
): Promise<{ data: Message[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('date', { ascending: true })

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data: data || [], error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

/**
 * Send a new message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  messageText: string
): Promise<{ data: Message | null; error: Error | null }> {
  try {
    const newMessage: MessageInsert = {
      conversation_id: conversationId,
      sender_id: senderId,
      message_item: messageText,
      date: new Date().toISOString(),
      is_read: false
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    // Update conversation timestamp
    await updateConversationTimestamp(conversationId)

    return { data, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ error: Error | null }> {
  try {
    // Mark all messages in this conversation that were NOT sent by the current user as read
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    return { 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()

  return subscription
}

/**
 * Subscribe to conversation updates (for real-time conversation list)
 */
export function subscribeToConversations(
  userId: string,
  callback: () => void
) {
  const subscription = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `or(participant1_id.eq.${userId},participant2_id.eq.${userId})`
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return subscription
}

// ==================== PROFILES ====================

/**
 * Get user profile by ID
 */
export async function getProfile(
  userId: string
): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

/**
 * Get user profile by phone number
 * Handles multiple formats: +63xxx, 63xxx, 09xxx
 */
export async function getProfileByPhone(
  phone: string
): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    // Get all possible phone variants to try
    const phoneVariants = getPhoneVariants(phone)
    
    console.log('🔍 Looking up phone:', phone)
    console.log('📱 Trying variants:', phoneVariants)
    
    // Try each variant
    for (const variant of phoneVariants) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', variant)
        .maybeSingle()
      
      if (data) {
        console.log('✅ Found profile with variant:', variant, data)
        return { data, error: null }
      }
      
      // If error is not "no rows", return it
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error looking up phone:', error)
        return { data: null, error: new Error(error.message) }
      }
    }
    
    // No match found in any variant
    console.warn('⚠️ No profile found for phone:', phone, 'tried variants:', phoneVariants)
    return { data: null, error: null }
  } catch (error) {
    console.error('❌ Exception in getProfileByPhone:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}

/**
 * Search users by phone number (for starting new chats)
 */
export async function searchUsersByPhone(
  phoneQuery: string
): Promise<{ data: Profile[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('phone', `%${phoneQuery}%`)
      .limit(10)

    if (error) {
      return { data: null, error: new Error(error.message) }
    }

    return { data: data || [], error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}
