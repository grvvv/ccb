// components/home/categories-section.tsx
import type { CategoryDetails } from '@/types/category'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { CategoryCard, CategorySkeleton } from './category-card'
import { Button } from '@/components/ui/button'

interface CategoryGridProps {
  categories: CategoryDetails[]
  isLoading: boolean
  serverPagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export default function CategoryGrid({
    categories,
    isLoading,
    serverPagination,
}: CategoryGridProps) {

  if (isLoading) {
    return(
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    )
    
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <LayoutGrid className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">No categories yet</p>
        <p className="text-xs mt-1">Check back soon</p>
      </div>
    )
   
  }

  return (
    <>
        {/* Mobile: 4-column grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-3 md:gap-6">
            {categories.map((cat, i) => (
              <CategoryCard key={cat._id} category={cat} index={i} />
            ))}
          </div>
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
    </>
  )
}