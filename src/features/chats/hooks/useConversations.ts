import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/supabase/supabase-api'
import { 
  getUserConversations, 
  subscribeToConversations,
  getOrCreateConversation,
  getProfileByPhone
} from '../api/supabaseChats'
import type { Conversation, Message, Profile } from '@/supabase/types'

export interface ConversationWithDetails extends Conversation {
  other_user: Profile | null
  last_message: Message | null
  unread_count: number
}

interface UseConversationsReturn {
  conversations: ConversationWithDetails[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  startConversationWithPhone: (phone: string) => Promise<{
    conversation: Conversation | null
    error: Error | null
  }>
}

/**
 * Hook to manage user's conversations with real-time updates
 * @param userId - Current user ID
 * @param initialData - Optional prefetched data from route loader
 */
export function useConversations(
  userId: string | null,
  initialData?: ConversationWithDetails[]
): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  // Fetch conversations with loading state (for initial load)
  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await getUserConversations(userId)
      
      if (fetchError) {
        setError(fetchError)
        setConversations([])
      } else {
        setConversations(data || [])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch conversations'))
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Silent refetch (for real-time updates) - doesn't trigger loading state
  const refetchSilently = useCallback(async () => {
    if (!userId) return

    try {
      const { data, error: fetchError } = await getUserConversations(userId)
      
      if (!fetchError && data) {
        setConversations(data)
        setError(null)
      }
    } catch (err) {
      // Silently fail for background updates
      console.error('Silent refetch failed:', err)
    }
  }, [userId])

  useEffect(() => {
    if (!initialData) {
      fetchConversations()
    }
  }, [fetchConversations, initialData])

  // Subscribe to real-time updates for conversations
  useEffect(() => {
    if (!userId) return

    const conversationSubscription = subscribeToConversations(userId, () => {
      console.log('🔄 Conversation updated, refetching silently...')
      refetchSilently()  // Use silent refetch
    })

    return () => {
      conversationSubscription.unsubscribe()
    }
  }, [userId, refetchSilently])

  // Subscribe to real-time updates for messages (to update last message in sidebar)
  useEffect(() => {
    if (!userId) return

    console.log('📡 Setting up message subscription for user:', userId)
    
    // Subscribe to all messages in conversations where user is a participant
    const messageSubscription = supabase
      .channel(`user-messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('📨 New message received, updating conversation list silently')
          // Use silent refetch to avoid showing skeleton
          refetchSilently()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('📖 Message updated (marked as read), updating conversation list silently')
          // Use silent refetch to update unread counts
          refetchSilently()
        }
      )
      .subscribe()

    return () => {
      messageSubscription.unsubscribe()
    }
  }, [userId, refetchSilently])

  /**
   * Start a new conversation with a user by their phone number
   */
  const startConversationWithPhone = useCallback(async (phone: string) => {
    console.log('🔄 startConversationWithPhone called with:', phone)
    
    if (!userId) {
      console.error('❌ User not authenticated')
      return { 
        conversation: null, 
        error: new Error('User not authenticated') 
      }
    }

    console.log('👤 Current user ID:', userId)

    try {
      // First, find the user by phone number
      console.log('🔍 Looking up profile by phone...')
      const { data: profile, error: profileError } = await getProfileByPhone(phone)
      
      if (profileError) {
        console.error('❌ Profile lookup error:', profileError)
        return { conversation: null, error: profileError }
      }

      if (!profile) {
        console.error('❌ No profile found for phone:', phone)
        return { 
          conversation: null, 
          error: new Error('User with this phone number not found') 
        }
      }

      console.log('✅ Found profile:', profile)

      // Check if user is trying to message themselves
      if (profile.id === userId) {
        console.error('❌ Cannot message yourself!')
        return {
          conversation: null,
          error: new Error('You cannot send messages to yourself')
        }
      }

      // Create or get existing conversation
      console.log('💬 Creating/getting conversation between:', userId, 'and', profile.id)
      const { data: conversation, error: convError } = await getOrCreateConversation(
        userId,
        profile.id
      )

      if (convError) {
        console.error('❌ Conversation creation error:', convError)
        return { conversation: null, error: convError }
      }

      console.log('✅ Conversation ready:', conversation)

      // Refetch conversations to update the list
      await fetchConversations()

      return { conversation, error: null }
    } catch (err) {
      console.error('❌ Exception in startConversationWithPhone:', err)
      return { 
        conversation: null, 
        error: err instanceof Error ? err : new Error('Failed to start conversation') 
      }
    }
  }, [userId, fetchConversations])

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    startConversationWithPhone
  }
}
