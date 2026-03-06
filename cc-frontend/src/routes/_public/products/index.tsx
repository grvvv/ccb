import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useProducts } from '@/hooks/use-product'
import { useState } from 'react'
import ProductGrid from '@/components/features/products/product-grid'
import type { SearchParams } from '@/types/general'
import { SearchBar } from '@/components/ui/search-bar'

export const Route = createFileRoute('/_public/products/')({
  component: RouteComponent,
})

const LIMIT = 30

function RouteComponent() {
    const [page, setPage] = useState(1)
    const { search }: SearchParams = useSearch({ from: '/_public/products/' })
    const { data, isLoading } = useProducts({ page, limit: LIMIT, search })
  
    const products = data?.result || []
    const total = data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  
    const navigate = useNavigate({ from: '/products' })
    const handleSearch = (value: string) => {
      // Reset to page 1 on new search
      setPage(1)
      navigate({
        search: (prev) => ({
          ...prev,
          search: value || undefined,
        }),
      })
    }
  return (
    <>
        <div className='max-w-7xl mx-auto px-6 py-4 space-y-4'>  
          <SearchBar
            defaultValue={search ?? ''}
            onSearch={handleSearch}
            placeholder={`Search...`}
          />
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
    </>
  )
}
