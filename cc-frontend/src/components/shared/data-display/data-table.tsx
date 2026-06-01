// components/ui/data-table.tsx

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SortAsc,
  SortDesc,
} from 'lucide-react'
import { type ReactNode } from 'react'

export interface ColumnDef<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  sortable?: boolean
  hideOnMobile?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

export interface SortState {
  key: string
  dir: 'asc' | 'desc'
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  rowKey: (row: T) => string

  // Controlled pagination
  page: number
  pageSize: number
  totalRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void

  // Controlled search
  search?: string
  onSearchChange?: (value: string) => void
  searchable?: boolean

  // Controlled sort
  sort?: SortState
  onSortChange?: (sort: SortState) => void

  toolbar?: ReactNode
  emptyMessage?: string
  isLoading?: boolean
  mobileSubline?: (row: T) => ReactNode
  onRowClick?: (row: T) => void
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  search = '',
  onSearchChange,
  searchable = true,
  sort,
  onSortChange,
  toolbar,
  emptyMessage = 'No records found.',
  isLoading = false,
  mobileSubline,
  onRowClick,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  const handleSort = (key: string) => {
    if (!onSortChange) return
    onSortChange({
      key,
      dir: sort?.key === key && sort.dir === 'asc' ? 'desc' : 'asc',
    })
    onPageChange(1)
  }

  const handleSearch = (val: string) => {
    onSearchChange?.(val)
    onPageChange(1)
  }

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className="space-y-4">
      {(searchable || toolbar) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {/* Desktop */}
      <div className="hidden sm:block rounded-xl border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={[
                      'px-4 py-3 font-medium text-xs uppercase tracking-wide text-muted-foreground',
                      alignClass[col.align ?? 'left'],
                      col.width ?? '',
                      col.sortable ? 'cursor-pointer select-none hover:text-foreground transition-colors' : '',
                    ].join(' ')}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && (
                        <span className="text-muted-foreground/40">
                          {sort?.key === col.key ? (
                            sort.dir === 'asc' ? (
                              <SortAsc className="h-3 w-3 text-primary" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-primary" />
                            )
                          ) : (
                            <SortAsc className="h-3 w-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={() => onRowClick?.(row)}
                    className={[
                      'border-b border-border last:border-0 hover:bg-muted/30 transition-colors',
                      onRowClick ? 'cursor-pointer' : '',
                    ].join(' ')}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          'px-4 py-3 text-sm text-foreground',
                          alignClass[col.align ?? 'left'],
                          col.width ?? '',
                        ].join(' ')}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards — unchanged from before */}
      <div className="sm:hidden space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          data.map((row) => {
            const visibleCols = columns.filter((c) => !c.hideOnMobile)
            const [first, ...rest] = visibleCols
            return (
              <div
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={[
                  'rounded-xl border border-border bg-card p-4 space-y-3',
                  onRowClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : '',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{first?.cell(row)}</div>
                    {mobileSubline && (
                      <div className="text-xs text-muted-foreground mt-0.5">{mobileSubline(row)}</div>
                    )}
                  </div>
                  {rest.length > 0 && <div className="shrink-0">{rest[rest.length - 1].cell(row)}</div>}
                </div>
                {rest.length > 1 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-border">
                    {rest.slice(0, -1).map((col) => (
                      <div key={col.key}>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
                          {col.header}
                        </p>
                        <div className="text-xs text-foreground">{col.cell(row)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground order-2 sm:order-1">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              onPageSizeChange(Number(v))
              onPageChange(1)
            }}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {totalRows === 0
              ? '0 results'
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalRows)} of ${totalRows}`}
          </span>
        </div>

        <div className="flex items-center gap-1 order-1 sm:order-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(1)} disabled={page === 1}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}