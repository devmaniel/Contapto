import { useState, useEffect, useCallback } from 'react'
import { 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead,
  subscribeToMessages
} from '../api/supabaseChats'
import type { Message } from '@/supabase/types'

interface UseMessagesReturn {
  messages: Message[]
  loading: boolean
  error: Error | null
  sendingMessage: boolean
  sendNewMessage: (messageText: string) => Promise<{
    success: boolean
    error: Error | null
  }>
  markAsRead: () => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Hook to manage messages in a conversation with real-time updates
 */
export function useMessages(
  conversationId: string | null,
  userId: string | null
): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await getConversationMessages(conversationId)
      
      if (fetchError) {
        setError(fetchError)
        setMessages([])
      } else {
        setMessages(data || [])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  // Fetch messages when conversation changes
  useEffect(() => {
    console.log('📥 Fetching messages for conversation:', conversationId)
    fetchMessages()
  }, [conversationId, fetchMessages])

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!conversationId) return

    const subscription = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(msg => msg.id === newMessage.id)
        if (exists) return prev
        
        // Add new message in chronological order
        return [...prev, newMessage].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId])

  /**
   * Send a new message in the conversation
   */
  const sendNewMessage = useCallback(async (messageText: string) => {
    if (!conversationId || !userId) {
      return { 
        success: false, 
        error: new Error('Missing conversation or user ID') 
      }
    }

    if (!messageText.trim()) {
      return { 
        success: false, 
        error: new Error('Message cannot be empty') 
      }
    }

    try {
      setSendingMessage(true)
      
      const { data, error: sendError } = await sendMessage(
        conversationId,
        userId,
        messageText.trim()
      )

      if (sendError) {
        return { success: false, error: sendError }
      }

      // Message will be added via real-time subscription
      // But we can add it optimistically for better UX
      if (data) {
        setMessages((prev) => {
          const exists = prev.some(msg => msg.id === data.id)
          if (exists) return prev
          return [...prev, data]
        })
      }

      return { success: true, error: null }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to send message') 
      }
    } finally {
      setSendingMessage(false)
    }
  }, [conversationId, userId])

  /**
   * Mark all unread messages in this conversation as read
   */
  const markAsRead = useCallback(async () => {
    if (!conversationId || !userId) return

    try {
      await markMessagesAsRead(conversationId, userId)
      
      // Update local state to mark messages as read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_id !== userId && !msg.is_read
            ? { ...msg, is_read: true }
            : msg
        )
      )
    } catch (err) {
      console.error('Failed to mark messages as read:', err)
    }
  }, [conversationId, userId])

  return {
    messages,
    loading,
    error,
    sendingMessage,
    sendNewMessage,
    markAsRead,
    refetch: fetchMessages
  }
}
