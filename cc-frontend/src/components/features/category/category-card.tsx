
import type { CategoryDetails } from '@/types/category'
import { Link } from '@tanstack/react-router'

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 animate-pulse">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted" />
      <div className="h-3 w-14 rounded bg-muted" />
    </div>
  )
}


export function CategoryCard({ category, index }: { category: CategoryDetails; index: number }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col items-center gap-2.5 outline-none"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image bubble */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-secondary border border-border transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : category.icon ? (
          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl">
            {category.icon}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {category.name.slice(0, 2)}
            </span>
          </div>
        )}

        {/* Subtle red tint on hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-300 rounded-2xl" />
      </div>

      {/* Label */}
      <span className="capitalize text-xs sm:text-[13px] font-medium text-foreground/80 group-hover:text-primary transition-colors duration-200 text-center leading-tight max-w-20 truncate">
        {category.name}
      </span>
    </Link>
  )
}
