// routes/index.tsx

import { Footer } from '@/components/shared/layout/footer'
import Header from '@/components/shared/layout/header'
import { authService } from '@/lib/auth'

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  component: Index,
})

function Index() {
  const isLoggedIn = authService.isAuth()
  const role = authService.getRole()

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        isAdmin={role === 'admin'}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}