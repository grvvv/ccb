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
      <div>
        <Header isLoggedIn={isLoggedIn} isAdmin={role === 'admin'} />
        <Outlet />
        <Footer />
      </div>
    )
}