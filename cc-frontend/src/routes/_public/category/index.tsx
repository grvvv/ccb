
import { CategoriesSection } from '@/components/features/category/category-grid'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/category/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <CategoriesSection />
      </div>
    </section>
  )
}
