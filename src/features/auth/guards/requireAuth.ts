import { redirect } from '@tanstack/react-router'
import { supabase } from '@/supabase/supabase-api'

/**
 * Route guard that requires authentication.
 * Use this in route's beforeLoad to protect the route.
 * 
 * @example
 * ```ts
 * export const Route = createFileRoute('/protected-page/')({
 *   beforeLoad: requireAuth,
 *   component: ProtectedPage,
 * })
 * ```
 */
export const requireAuth = async () => {
  const { data } = await supabase.auth.getSession()
  
  if (!data.session) {
    throw redirect({ to: '/login' })
  }
  
  // Return session data so it can be used in the route if needed
  return { session: data.session }
}
