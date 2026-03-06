// routes/admin/carousels/index.tsx

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
import { useCarousels, useDeleteCarousel } from '@/hooks/use-carousel'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ExternalLink, GalleryHorizontal, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DataTable, type ColumnDef } from '@/components/shared/data-display/data-table'
import type { CarouselDetails } from '@/types/carousel'

export const Route = createFileRoute('/admin/carousel/')({
  component: CarouselsPage,
})


// ─── Page ─────────────────────────────────────────────────────────────────────

function CarouselsPage() {
  const navigate = useNavigate()
  const { data: carouselsResponse, isLoading } = useCarousels()
  const carousels = carouselsResponse?.result ?? []

  const deleteCarousel = useDeleteCarousel()
  const [deleteTarget, setDeleteTarget] = useState<CarouselDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCarousel.mutateAsync(deleteTarget._id)
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ── Columns ─────────────────────────────────────────────────────────────
  const columns: ColumnDef<CarouselDetails>[] = [
    {
      key: 'slide',
      header: 'Slide',
      sortAccessor: (r) => r.title,
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          {/* Banner thumbnail */}
          <div className="shrink-0 w-20 h-10 rounded-md overflow-hidden bg-secondary border border-border">
            <img
              src={row.imageUrl}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate max-w-[200px]">
              {row.title}
            </p>
            {row.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      align: 'center',
      width: 'w-20',
      sortAccessor: (r) => r.order,
      hideOnMobile: true,
      cell: (row) => (
        <Badge variant="secondary" className="text-xs font-mono tabular-nums">
          #{row.order ?? 0}
        </Badge>
      ),
    },
    {
      key: 'redirectUrl',
      header: 'Redirect URL',
      hideOnMobile: true,
      cell: (row) =>
        row.redirectUrl ? (
          <a
            href={row.redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[200px]"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span className="truncate">{row.redirectUrl}</span>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
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
                  to: '/admin/carousel/$carouselId/edit',
                  params: { carouselId: row._id },
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
            <h1 className="text-xl font-semibold text-foreground">Carousels</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? 'Loading…' : `${carousels.length} slide${carousels.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/admin/carousel/add' })}
            className="gap-1.5"
          >
            <GalleryHorizontal className="h-4 w-4" />
            Add Slide
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <DataTable
          data={carousels}
          columns={columns}
          rowKey={(r) => r._id}
          isLoading={isLoading}
          searchable
          searchFields={(r) => [r.title, r.description ?? '', r.redirectUrl ?? ''].join(' ')}
          emptyMessage="No carousel slides yet. Add your first slide to get started."
          mobileSubline={(r) => (
            <span>
              Order #{r.order ?? 0}
              {r.redirectUrl && <span className="ml-1">· {r.redirectUrl}</span>}
            </span>
          )}
        />
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete slide?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.title}</strong> will be permanently removed. This action cannot
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