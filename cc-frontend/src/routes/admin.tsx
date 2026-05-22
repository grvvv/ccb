import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  LogOut, Menu, ChevronLeft, ChevronRight,
  ArrowBigRightDashIcon,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/molecules/mode-toogle'
import { useAuth } from '@/hooks/use-auth'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

const navSections = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/admin/' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { icon: Package, label: 'Products', to: '/admin/products' },
      { icon: Tag, label: 'Categories', to: '/admin/categories' },
    ],
  },
  {
    label: 'Store',
    items: [
      { icon: ShoppingCart, label: 'Orders', to: '/admin/orders' },
      { icon: ArrowBigRightDashIcon, label: 'Carousel', to: '/admin/carousel' },
    ],
  },
]

const footerItems = [
  { icon: Globe, label: 'Public Page', to: '/' },
]

function NavItem({
  icon: Icon, label, to, collapsed,
}: {
  icon: React.ElementType
  label: string
  to: string
  collapsed: boolean
}) {
  const router = useRouterState()
  const isActive = router.location.pathname === to ||
    (to !== '/admin/' && router.location.pathname.startsWith(to))

  const inner = (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
        'text-muted-foreground hover:bg-muted hover:text-foreground',
        isActive && 'bg-muted text-foreground font-medium',
        collapsed && 'justify-center px-0',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return inner
}

function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const { logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className={cn('flex items-center gap-2.5 h-[52px] px-3 border-b shrink-0', collapsed && 'justify-center px-0')}>
        <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-medium shrink-0">
          A
        </div>
        {!collapsed && <span className="text-sm font-medium">Admin</span>}
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[11px] text-muted-foreground px-2 pb-1 tracking-wide">
                  {section.label.toUpperCase()}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.to} {...item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-2 border-t space-y-0.5">
          {footerItems.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
          <button
            className={cn(
              'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm w-full',
              'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              collapsed && 'justify-center px-0',
            )}
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </TooltipProvider>
    </div>
  )
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouterState()

  const segments = router.location.pathname.replace('/admin', '').split('/').filter(Boolean)
  const breadcrumb = segments.length ? segments[segments.length - 1] : 'dashboard'

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-background transition-all duration-200',
          collapsed ? 'w-[52px]' : 'w-[220px]',
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="h-[52px] border-b bg-background flex items-center px-4 gap-3 shrink-0">
          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[220px] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="flex-1 text-sm text-muted-foreground capitalize">
            Admin / <span className="text-foreground font-medium">{breadcrumb}</span>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}