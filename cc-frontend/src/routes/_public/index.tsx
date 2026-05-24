import { createFileRoute, Link } from '@tanstack/react-router'
import ProductGrid from '@/components/features/products/product-grid'
import { useProducts } from '@/hooks/use-product'
import { useState } from 'react'
import { HeroCarousel } from '@/components/molecules/hero-carousel'
import { CategoriesSection } from '@/components/features/category/category-grid'
import { ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/_public/')({
  component: RouteComponent,
})

const LIMIT = 6

function RouteComponent() {
  const [page, setPage] = useState(1)
  const { data: productResponse, isLoading } = useProducts({ page, limit: LIMIT })
  const products = productResponse?.result ?? []
  const total = productResponse?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div>
      <HeroCarousel />

      <CategoriesSection />

      {/* Featured Products */}
      <section className="py-10 sm:py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary mb-1">
                Products
              </p>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
                Browse All Products
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Find exactly what you're looking for
              </p>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors shrink-0 ml-6"
            >
              <span className="hidden sm:inline">View all</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          serverPagination={{ currentPage: page, totalPages, onPageChange: setPage }}
        />
      </section>
    </div>
  )
}