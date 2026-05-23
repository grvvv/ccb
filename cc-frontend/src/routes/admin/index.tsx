import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowBigRightDash, Package, ShoppingCart, Tag } from 'lucide-react'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

const sections = [
  {
    title: 'Products',
    icon: Package,
    colorClass: 'bg-blue-50 text-blue-700',
    links: [
      { label: 'View all products', to: '/admin/products', icon: 'ti-list', primary: true },
      { label: 'New product', to: '/admin/products/new', icon: 'ti-plus' },
    ],
  },
  {
    title: 'Categories',
    icon: Tag,
    colorClass: 'bg-emerald-50 text-emerald-700',
    links: [
      { label: 'View all categories', to: '/admin/categories', icon: 'ti-list', primary: true },
      { label: 'New category', to: '/admin/categories/new', icon: 'ti-plus' },
    ],
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    colorClass: 'bg-amber-50 text-amber-700',
    links: [
      { label: 'View all orders', to: '/admin/orders', icon: 'ti-list', primary: true },
    ],
  },
  {
    title: 'Carousel',
    icon: ArrowBigRightDash,
    colorClass: 'bg-violet-50 text-violet-700',
    links: [
      { label: 'View carousels', to: '/admin/carousel', icon: 'ti-list', primary: true },
      { label: 'Add carousel', to: '/admin/carousel/add', icon: 'ti-plus' },
    ],
  },
]

function RouteComponent() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-medium">Admin</h1>
        <span className="text-sm text-muted-foreground">Manage your store</span>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-background border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${section.colorClass}`}>
                <section.icon />
              </div>
              <span className="text-sm font-medium">{section.title}</span>
            </div>

            <div className="flex flex-col gap-1">
              {section.links.map((link, i) => (
                <>
                  {i === 1 && <hr key="divider" className="border-border/50 my-1" />}
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors ${
                      link.primary ? 'text-blue-600 font-medium' : 'text-foreground'
                    }`}
                  >
                    <i className={`ti ${link.icon} text-[14px] opacity-60`} />
                    {link.label}
                  </Link>
                </>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}