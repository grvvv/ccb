// routes/admin/categories/index.tsx


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
import { useCategories, useDeleteCategory } from '@/hooks/use-category'
import type { CategoryDetails } from '@/types/category'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FolderOpen, FolderPlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTable, type ColumnDef } from '@/components/shared/data-display/data-table'

export const Route = createFileRoute('/admin/categories/')({
  component: CategoriesPage,
})

function getCategoryName(parent: CategoryDetails['parent']) {
  if (!parent) return null
  if (typeof parent === 'string') return parent
  return parent.name
}

function CategoriesPage() {
  const navigate = useNavigate()
  const { data: categoriesResponse, isLoading } = useCategories()
  const categories: CategoryDetails[] = categoriesResponse?.result ?? []

  const deleteCategory = useDeleteCategory()
  const [deleteTarget, setDeleteTarget] = useState<CategoryDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCategory.mutateAsync(deleteTarget._id)
      toast.success(`"${deleteTarget.name}" deleted.`)
    } catch {
      toast.error('Failed to delete category.')
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const columns: ColumnDef<CategoryDetails>[] = [
    {
      key: 'category',
      header: 'Category',
      sortAccessor: (r) => r.name,
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          {/* Image or icon */}
          <div className="shrink-0 h-10 w-10 rounded-xl overflow-hidden bg-secondary border border-border flex items-center justify-center">
            {row.image ? (
              <img src={row.image} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">{row.icon || '📁'}</span>
            )}
          </div>

          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate max-w-[180px]">
              {row.name}
            </p>
            <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {row.slug}
            </code>
          </div>
        </div>
      ),
    },
    {
      key: 'icon',
      header: 'Icon',
      width: 'w-16',
      align: 'center',
      hideOnMobile: true,
      cell: (row) => (
        <span className="text-2xl">{row.icon || '—'}</span>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      hideOnMobile: true,
      sortAccessor: (r) => getCategoryName(r.parent) ?? '',
      cell: (row) => {
        const parentName = getCategoryName(row.parent)
        return parentName ? (
          <div className="flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground truncate max-w-[140px]">{parentName}</span>
          </div>
        ) : (
          <Badge variant="secondary" className="text-[10px] font-normal">
            Root
          </Badge>
        )
      },
    },
    {
      key: 'order',
      header: 'Order',
      width: 'w-20',
      align: 'center',
      hideOnMobile: true,
      sortAccessor: (r) => r.order,
      cell: (row) => (
        <Badge variant="secondary" className="text-xs font-mono tabular-nums">
          #{row.order ?? 0}
        </Badge>
      ),
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
              onClick={() =>
                navigate({
                  to: '/admin/categories/$categoryId/edit',
                  params: { categoryId: row._id },
                })
              }
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
            <h1 className="text-xl font-semibold text-foreground">Categories</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading
                ? 'Loading…'
                : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/admin/categories/new' })}
            className="gap-1.5"
          >
            <FolderPlus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <DataTable
          data={categories}
          columns={columns}
          rowKey={(r) => r._id}
          isLoading={isLoading}
          searchable
          searchFields={(r) =>
            [r.name, r.slug, getCategoryName(r.parent) ?? ''].join(' ')
          }
          emptyMessage="No categories yet. Add your first category to get started."
          mobileSubline={(r) => {
            const parentName = getCategoryName(r.parent)
            return (
              <span>
                {parentName ? `Under ${parentName}` : 'Root category'} · Order #{r.order ?? 0}
              </span>
            )
          }}
        />
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> will be permanently removed. Any sub-categories
              linked to it may also be affected.
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