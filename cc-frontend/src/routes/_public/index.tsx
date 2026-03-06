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
      {/* Hero Carousel */}
      <HeroCarousel />

      <section className="py-12 bg-background">
        <CategoriesSection />
      </section>

      {/* Featured Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-base sm:text-2xl font-semibold text-foreground">
                Browse All Products
              </h1>
              <p className="text-lg text-muted-foreground mt-0.5">
                Find exactly what you're looking for
              </p>
            </div>

            <Link
              to="/products"
              className="group inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          serverPagination={{
            currentPage: page,
            totalPages,
            onPageChange: setPage,
          }}
        />
      </section>


    </div>
  )
}