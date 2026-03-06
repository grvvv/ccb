// routes/admin/products/index.tsx

import { DataTable, type ColumnDef } from '@/components/shared/data-display/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useProducts, useDeleteProduct } from '@/hooks/use-product'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MoreHorizontal, PackagePlus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/products/')({
  component: ProductsPage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string
  name: string
  category: { _id: string; name: string } | string
  price: number
  sellingPrice: number
  images: { url: string; publicId: string }[] | string[]
  description?: string
  createdAt?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function getDiscount(price: number, selling: number) {
  if (!price || !selling || selling >= price) return null
  return Math.round(((price - selling) / price) * 100)
}

function getCategoryName(cat: Product['category']) {
  if (typeof cat === 'string') return cat
  return cat?.name ?? '—'
}

function getThumbnail(images: Product['images']) {
  if (!images?.length) return null
  const first = images[0]
  return typeof first === 'string' ? first : first.url
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProductsPage() {
  const navigate = useNavigate()
  const { data: productsResponse, isLoading } = useProducts()
  const products = productsResponse?.result ?? []

  const deleteProduct = useDeleteProduct()
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteProduct.mutateAsync(deleteTarget._id)
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ── Column definitions ──────────────────────────────────────────────────
  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortAccessor: (r) => r.name,
      cell: (row) => {
        const thumb = getThumbnail(row.images)
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-secondary border border-border">
              {thumb ? (
                <img src={thumb} alt={row.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                  —
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate max-w-[180px]">
                {row.name}
              </p>
              {row.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {row.description}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      header: 'Category',
      hideOnMobile: true,
      sortAccessor: (r) => getCategoryName(r.category),
      cell: (row) => (
        <Badge variant="secondary" className="text-xs font-normal">
          {getCategoryName(row.category)}
        </Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      hideOnMobile: true,
      sortAccessor: (r) => r.price,
      cell: (row) => (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(row.price)}
        </span>
      ),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      align: 'right',
      sortAccessor: (r) => r.sellingPrice,
      cell: (row) => {
        const discount = getDiscount(row.price, row.sellingPrice)
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-foreground">
              {formatPrice(row.sellingPrice)}
            </span>
            {discount && (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0">
                -{discount}%
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      width: 'w-12',
      align: 'right',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => navigate({ to: '/admin/products/$productId/edit', params: { productId: row._id } })}
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Products</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/admin/products/new' })}
            className="gap-1.5"
          >
            <PackagePlus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <DataTable
          data={products}
          columns={columns}
          rowKey={(r) => r._id}
          isLoading={isLoading}
          searchable
          searchFields={(r) =>
            [r.name, getCategoryName(r.category), r.description ?? ''].join(' ')
          }
          emptyMessage="No products yet. Add your first product to get started."
          mobileSubline={(r) => (
            <span>
              {getCategoryName(r.category)} · {formatPrice(r.sellingPrice)}
              {getDiscount(r.price, r.sellingPrice) && (
                <span className="text-primary ml-1">-{getDiscount(r.price, r.sellingPrice)}%</span>
              )}
            </span>
          )}
        />
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> will be permanently removed. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}