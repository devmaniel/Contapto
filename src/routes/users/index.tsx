import UserListPage from '@/features/user/UserViewPage'
import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'

export const Route = createFileRoute('/users/')({
  beforeLoad: requireAuth,
  component: () => (
    <UserListPage />
  ),
})
