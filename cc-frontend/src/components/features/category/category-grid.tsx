// components/home/categories-section.tsx

import { useCategories } from '@/hooks/use-category'
import type { CategoryDetails } from '@/types/category'
import { LayoutGrid } from 'lucide-react'
import { CategoryCard, CategorySkeleton } from './category-card'

export function CategoriesSection() {
  const { data, isLoading } = useCategories()
  const categories: CategoryDetails[] = data?.result || []

  const rootCategories = categories
    .filter((c) => !c.parent)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))


  if (isLoading) {
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  }

  if (categories.length == 0) {
    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground">
      <LayoutGrid className="h-10 w-10 mb-3 opacity-30" />
      <p className="text-sm font-medium">No categories yet</p>
      <p className="text-xs mt-1">Check back soon</p>
    </div>
  }

  return (
    <>
        {/* Mobile: 4-column grid */}
        <div className="sm:hidden">
          <div className="grid grid-cols-4 gap-3">
            {rootCategories.map((cat, i) => (
              <CategoryCard key={cat._id} category={cat} index={i} />
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {rootCategories.map((cat, i) => (
            <CategoryCard key={cat._id} category={cat} index={i} />
          ))}
        </div>
    </>
  )
}