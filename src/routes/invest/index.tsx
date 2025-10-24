import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'
import InvestPage from '@/features/invest/InvestPage'

export const Route = createFileRoute('/invest/')({
  beforeLoad: requireAuth,
  component: InvestPage,
})

