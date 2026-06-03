import { createFileRoute, Link } from '@tanstack/react-router'
import ProductGrid from '@/components/features/products/product-grid'
import { useProducts } from '@/hooks/use-product'
import { useState } from 'react'
import { HeroCarousel } from '@/components/molecules/hero-carousel'
import { ArrowRight } from 'lucide-react'
import CategoryGrid from '@/components/features/category/category-grid'
import { useCategories } from '@/hooks/use-category'

export const Route = createFileRoute('/_public/')({
  component: RouteComponent,
})

const LIMIT = 12

function RouteComponent() {
  const [productPage, setProductPage] = useState(1)
  const [categoryPage, setCategoryPage] = useState(1)
  const { data: productResponse, isLoading: productsLoading } = useProducts({ page: productPage, limit: LIMIT })
  const products = productResponse?.result ?? []
  const totalProducts = productResponse?.total ?? 0
  const totalProductPages = Math.max(1, Math.ceil(totalProducts / LIMIT))
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategories({ page: categoryPage, limit: LIMIT })
  const categories = categoriesResponse?.result ?? []
  const totalCategories = categoriesResponse?.total ?? 0
  const totalCategoryPages = Math.max(1, Math.ceil(totalCategories / LIMIT))

  return (
    <div>
      <HeroCarousel />

      <section className="py-10 sm:py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Section header */}
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary mb-1">
                Categories
              </p>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground leading-tight">
                Browse All Products
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Find exactly what you're looking for
              </p>
            </div>

            <Link
              to="/category"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors shrink-0 ml-6"
            >
              <span className="hidden sm:inline">View all</span>
              <span className="sm:hidden">All</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <CategoryGrid
            categories={categories}
            isLoading={categoriesLoading}
            serverPagination={{ currentPage: categoryPage, totalPages: totalCategoryPages, onPageChange: setCategoryPage }}
          />
        </div>
      </section>

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
          isLoading={productsLoading}
          serverPagination={{ currentPage: productPage, totalPages: totalProductPages, onPageChange: setProductPage }}
        />
      </section>
    </div>
  )
}