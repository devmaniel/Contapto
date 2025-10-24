import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/supabase/supabase-api'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    
    if (data.session) {
      // User is authenticated, redirect to chats
      throw redirect({ to: '/chats' })
    } else {
      // User is guest, redirect to login
      throw redirect({ to: '/login' })
    }
  },
})
