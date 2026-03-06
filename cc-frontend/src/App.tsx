import { createRouter, RouterProvider } from '@tanstack/react-router'
import './App.css'
 
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './contexts/use-theme'
import NotFound from './components/shared/data-display/not-found'
import { TooltipProvider } from './components/ui/tooltip'
 
// Create a new router instance
const router = createRouter({ routeTree , 
  defaultNotFoundComponent: () => <NotFound />
})
 
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
 
function App() {
  return (
    <TooltipProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </TooltipProvider>
    
  )
}
 
export default App