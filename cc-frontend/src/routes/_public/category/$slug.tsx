import ProductGrid from '@/components/features/products/product-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { useProducts } from '@/hooks/use-product';
import type { SearchParams } from '@/types/general';
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/_public/category/$slug')({
  component: RouteComponent,
})

const LIMIT = 20

function RouteComponent() {
  const { slug } = useParams({ from: '/_public/category/$slug' });
  const [page, setPage] = useState(1)
  const navigate = useNavigate({ from: '/category/$slug' })

  const { search }: SearchParams = useSearch({ from: '/_public/category/$slug' })
  const { data, isLoading } = useProducts({ page, limit: LIMIT, search, category: slug })

  const products = data?.result || []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

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
        <div>
          Products based on category: <b>{slug}</b>
        </div>

        <SearchBar
          defaultValue={search ?? ''}
          onSearch={handleSearch}
          placeholder={`Search in ${slug}...`}
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