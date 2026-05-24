// product-grid.tsx
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { ProductDetails } from '@/types/product'
import { ArrowRight, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react'
import ProductCard from './product-card'
import { Link } from '@tanstack/react-router'

interface ProductGridProps {
  products: ProductDetails[]
  isLoading: boolean
  serverPagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export default function ProductGrid({
  products,
  isLoading,
  serverPagination,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="mx-auto" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <PackageSearch className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">No products found</p>
        <p className="text-xs mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        {serverPagination && serverPagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => serverPagination.onPageChange(serverPagination.currentPage - 1)}
              disabled={serverPagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: serverPagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const cur = serverPagination.currentPage
                  return p === 1 || p === serverPagination.totalPages || Math.abs(p - cur) <= 1
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === serverPagination.currentPage ? 'default' : 'ghost'}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => serverPagination.onPageChange(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => serverPagination.onPageChange(serverPagination.currentPage + 1)}
              disabled={serverPagination.currentPage === serverPagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </ section>
  )
}