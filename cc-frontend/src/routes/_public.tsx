// routes/_public.tsx
import { memo, useMemo } from 'react'
import { Footer } from '@/components/shared/layout/footer'
import Header from '@/components/shared/layout/header'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { useCategories } from '@/hooks/use-category'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

// ✅ Memoized shell — only re-renders if isLoggedIn/isAdmin/categories changes
const PublicShell = memo(function PublicShell({
  isLoggedIn,
  isAdmin,
  categories,
}: {
  isLoggedIn: boolean
  isAdmin: boolean
  categories: any[]
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin} categories={categories} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer categories={categories} />
    </div>
  )
})

function PublicLayout() {
  const { user, isAuthenticated } = useAuth()
  const { data: categoryData } = useCategories({ page: 1, limit: 6 })

  const isAdmin = user?.role === 'admin'

  // ✅ Stable reference — only changes when actual data changes
  const categories = useMemo(
    () => categoryData?.result ?? [],
    [categoryData?.result]
  )

  const isLoggedIn = isAuthenticated  // already a primitive boolean

  return (
    <PublicShell
      isLoggedIn={isLoggedIn}
      isAdmin={isAdmin}
      categories={categories}
    />
  )
}