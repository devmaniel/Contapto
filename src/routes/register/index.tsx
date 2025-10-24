import Register from '@/features/register/Register'
import { createFileRoute } from '@tanstack/react-router'
import { requireGuest } from '@/features/auth/guards'

export const Route = createFileRoute('/register/')({
  beforeLoad: requireGuest,
  component: Register,
})
