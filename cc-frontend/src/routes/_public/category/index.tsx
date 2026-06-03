
import CategoryGrid from '@/components/features/category/category-grid'
import { SearchBar } from '@/components/ui/search-bar'
import { useCategories } from '@/hooks/use-category'
import type { SearchParams } from '@/types/general'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_public/category/')({
  component: RouteComponent,
})

const LIMIT = 30

function RouteComponent() {
  const [categoryPage, setCategoryPage] = useState(1)
  const { search }: SearchParams = useSearch({ from: '/_public/category/' })

  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategories({ page: categoryPage, search, limit: LIMIT })
  const categories = categoriesResponse?.result ?? []
  const totalCategories = categoriesResponse?.total ?? 0
  const totalCategoryPages = Math.max(1, Math.ceil(totalCategories / LIMIT))
  
  const navigate = useNavigate({ from: '/category' })
  const handleSearch = (value: string) => {
    // Reset to page 1 on new search
    setCategoryPage(1)
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
      }),
    })
  }
  return (
    <section className="my-4">
      <div className='max-w-7xl mx-auto px-6 py-4 space-y-4 mb-6'>
        <SearchBar
          defaultValue={search ?? ''}
          onSearch={handleSearch}
          placeholder={`Search...`}
        />
      </div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        <CategoryGrid
          categories={categories}
          isLoading={categoriesLoading}
          serverPagination={{ currentPage: categoryPage, totalPages: totalCategoryPages, onPageChange: setCategoryPage }}
        />
      </div>
      
    </section>
  )
}
