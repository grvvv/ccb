
import { Spinner } from '@/components/ui/spinner'
import type { ProductDetails } from '@/types/product'
import ProductCard from './product-card'

interface ProductGridProps {
  products: ProductDetails[]
  isLoading: boolean
  serverPagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return <Spinner className="mx-auto my-12" />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id}>
            <ProductCard product={product} />
          </div>   
        ))}
      </div>
    </div>
  );
}