// components/home/categories-section.tsx

import { useCategories } from '@/hooks/use-category'
import type { CategoryDetails } from '@/types/category'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { CategoryCard, CategorySkeleton } from './category-card'

export function CategoriesSection() {
  const { data, isLoading } = useCategories()
  const categories: CategoryDetails[] = data?.result || []

  // Only show root-level categories (no parent), sorted by order
  const rootCategories = categories
    .filter((c) => !c.parent)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-base sm:text-2xl font-semibold text-foreground">
              Shop by Category
            </h1>
            <p className="text-lg text-muted-foreground mt-0.5">
              Find exactly what you're looking for
            </p>
          </div>

          <Link
            to="/category"
            className="group inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Categories strip */}
        <div className="relative">
          {/* Fade edges on mobile for scroll hint */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-background to-transparent z-10 pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-linear-to-l from-background to-transparent z-10 pointer-events-none sm:hidden" />

          <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex sm:grid sm:grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4 sm:gap-5 w-max sm:w-auto pb-1">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
                : rootCategories.length > 0
                ? rootCategories.map((cat, i) => (
                    <CategoryCard key={cat._id} category={cat} index={i} />
                  ))
                : null}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {!isLoading && rootCategories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No categories available yet.
          </p>
        )}
      </div>
  )
}