import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { createQueryClient } from '@/app/query-client'
import { routeTree } from '@/routeTree.gen'

export function renderApp(initialPath = '/') {
  const queryClient = createQueryClient()
  const history = createMemoryHistory({
    initialEntries: [initialPath],
  })
  const router = createRouter({
    routeTree,
    history,
    context: { queryClient },
    defaultPendingMs: 0,
  })

  const renderResult = render(
    <RouterProvider router={router} context={{ queryClient }} />,
  )

  return {
    ...renderResult,
    queryClient,
    router,
  }
}
