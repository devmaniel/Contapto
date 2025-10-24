import { createFileRoute } from '@tanstack/react-router'
import TestIndex from '../../features/test/TestIndex'

export const Route = createFileRoute('/test-ui/')({
  component: TestIndex,
})
