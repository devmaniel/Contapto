import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guards'
import Layout1 from '../../shared/layouts/Layout1'
import RechargePage from '../../features/recharge/RechargePage'

export const Route = createFileRoute('/recharge/')({
  beforeLoad: requireAuth,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout1>
      <RechargePage />
    </Layout1>
  )
}
