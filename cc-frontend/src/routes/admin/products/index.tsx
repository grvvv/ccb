// routes/admin/products/index.tsx

import { DataTable, type ColumnDef, type SortState } from '@/components/shared/data-display/data-table'
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
import { debounce } from 'lodash'
import { useMemo, useEffect, useState } from 'react'
import type { ProductDetails } from '@/types/product'

export const Route = createFileRoute('/admin/products/')({
    component: ProductsPage,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function getDiscount(price: number, selling: number) {
    if (!price || !selling || selling >= price) return null
    return Math.round(((price - selling) / price) * 100)
}

function getCategoryName(cat: ProductDetails['category']) {
    if (typeof cat === 'string') return cat
    return cat ?? '—'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProductsPage() {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sort, setSort] = useState<SortState | undefined>(undefined)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const navigate = useNavigate()
    const { data: productsResponse, isLoading } = useProducts({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
    })
    const products: ProductDetails[] = productsResponse?.result ?? []
    const total = productsResponse?.total ?? 0

    const deleteProduct = useDeleteProduct()
    const [deleteTarget, setDeleteTarget] = useState<ProductDetails | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSort = (s: SortState) => { setSort(s); setPage(1) }

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

    const debouncedSetSearch = useMemo(
        () =>
            debounce((value: string) => {
            setDebouncedSearch(value)
            }, 600),
        []
    )
    const handleSearch = (val: string) => { 
        setSearch(val); 
        setPage(1);
        debouncedSetSearch(val)
    }

    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel()
        }
    }, [debouncedSetSearch])

    const columns: ColumnDef<ProductDetails>[] = [
        {
            key: 'name',
            header: 'Product',
            cell: (row) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-secondary border border-border">
                        {row.thumbnail ? (
                            <img src={row.thumbnail} alt={row.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">—</div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate max-w-[180px]">{row.name}</p>
                        {row.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{row.description}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            hideOnMobile: true,
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
            cell: (row) => (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(row.price)}</span>
            ),
        },
        {
            key: 'sellingPrice',
            header: 'Selling Price',
            align: 'right',
            cell: (row) => {
                const discount = getDiscount(row.price, row.sellingPrice)
                return (
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-medium text-foreground">{formatPrice(row.sellingPrice)}</span>
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
            <div className="border-b border-border bg-card">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Products</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {
                                isLoading
                                ? 'Loading…'
                                    : `${total} product${total !== 1 ? 's' : ''}`
                            }
                        </p>
                    </div>
                    <Button size="sm" onClick={() => navigate({ to: '/admin/products/new' })} className="gap-1.5">
                        <PackagePlus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <DataTable
                    data={products}
                    columns={columns}
                    rowKey={(r) => r._id}
                    isLoading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    totalRows={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                    searchable
                    search={search}
                    onSearchChange={handleSearch}
                    sort={sort}
                    onSortChange={handleSort}
                    emptyMessage="No products yet. Add your first product to get started."
                    mobileSubline={(r) => {
                        const discount = getDiscount(r.price, r.sellingPrice)
                        return (
                            <span>
                                {getCategoryName(r.category)} · {formatPrice(r.sellingPrice)}
                                {discount && <span className="text-primary ml-1">-{discount}%</span>}
                            </span>
                        )
                    }}
                />
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{deleteTarget?.name}</strong> will be permanently removed. This action cannot be undone.
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