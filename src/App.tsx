import { createRouter, RouterProvider } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

// Supports weights 100-900
import '@fontsource-variable/inter';

const router = createRouter({routeTree});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
