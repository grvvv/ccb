// components/home/categories-section.tsx

import { useCategories } from '@/hooks/use-category'
import type { CategoryDetails } from '@/types/category'
import { Link } from '@tanstack/react-router'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { CategoryCard, CategorySkeleton } from './category-card'

export function CategoriesSection() {
  const { data, isLoading } = useCategories()
  const categories: CategoryDetails[] = data?.result || []

  const rootCategories = categories
    .filter((c) => !c.parent)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
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
            to="/products"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors shrink-0 ml-6"
          >
            <span className="hidden sm:inline">View all</span>
            <span className="sm:hidden">All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Categories */}
        {isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : rootCategories.length > 0 ? (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="relative sm:hidden">
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />
              <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
                <div className="flex gap-3 w-max pb-1">
                  {rootCategories.map((cat, i) => (
                    <div key={cat._id} className="w-20">
                      <CategoryCard category={cat} index={i} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {rootCategories.map((cat, i) => (
                <CategoryCard key={cat._id} category={cat} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground">
            <LayoutGrid className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No categories yet</p>
            <p className="text-xs mt-1">Check back soon</p>
          </div>
        )}
      </div>
    </section>
  )
}