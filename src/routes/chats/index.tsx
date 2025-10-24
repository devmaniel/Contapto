import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'
import ChatsIndexPage from '../../features/chats/ChatsIndexPage'
import { supabase } from '@/supabase/supabase-api'
import { getUserConversations, getConversationMessages } from '@/features/chats/api/supabaseChats'

export const Route = createFileRoute('/chats/')({
  beforeLoad: requireAuth,
  loader: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      console.log('🚀 Prefetching conversations for user:', user.id)
      const { data: conversations } = await getUserConversations(user.id)
      
      if (conversations && conversations.length > 0) {
        const firstConvId = conversations[0].id
        console.log('🚀 Prefetching messages for first conversation:', firstConvId)
        const { data: messages } = await getConversationMessages(firstConvId)
        return { 
          conversations: conversations || [], 
          firstConversationId: firstConvId,
          firstConversationMessages: messages || []
        }
      }
      
      return { conversations: [], firstConversationId: null, firstConversationMessages: [] }
    }
    
    return { conversations: [], firstConversationId: null, firstConversationMessages: [] }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <ChatsIndexPage />
}
