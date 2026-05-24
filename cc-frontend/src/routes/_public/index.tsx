import { createFileRoute, Link } from '@tanstack/react-router'
import ProductGrid from '@/components/features/products/product-grid'
import { useProducts } from '@/hooks/use-product'
import { useState } from 'react'
import { HeroCarousel } from '@/components/molecules/hero-carousel'
import { CategoriesSection } from '@/components/features/category/category-grid'

export const Route = createFileRoute('/_public/')({
  component: RouteComponent,
})

const LIMIT = 8

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
      <ProductGrid
        products={products}
        isLoading={isLoading}
        serverPagination={{ currentPage: page, totalPages, onPageChange: setPage }}
      />
    </div>
  )
}