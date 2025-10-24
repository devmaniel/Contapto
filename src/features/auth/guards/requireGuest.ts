import { redirect } from '@tanstack/react-router'
import { supabase } from '@/supabase/supabase-api'

/**
 * Route guard that requires NO authentication (guest only).
 * Use this in route's beforeLoad for login/register pages.
 * Redirects to /chats if user is already authenticated.
 * 
 * @example
 * ```ts
 * export const Route = createFileRoute('/login/')({
 *   beforeLoad: requireGuest,
 *   component: Login,
 * })
 * ```
 */
export const requireGuest = async () => {
  const { data } = await supabase.auth.getSession()
  
  if (data.session) {
    throw redirect({ to: '/chats' })
  }
}
