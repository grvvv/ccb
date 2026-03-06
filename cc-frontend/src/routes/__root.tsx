import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const RootLayout = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  </>
  
)

export const Route = createRootRoute({ component: RootLayout })