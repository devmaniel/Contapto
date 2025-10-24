import { createFileRoute } from '@tanstack/react-router'
import { requireGuest } from '@/features/auth/guards'
import Login from '@/features/login/Login'

export const Route = createFileRoute('/login/')({
  beforeLoad: requireGuest,
  component: Login,
})
