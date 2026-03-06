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
import { useState, useMemo, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique key for this column */
  key: string
  /** Header label */
  header: string
  /** Render cell content. Receives the row and the raw value */
  cell: (row: T) => ReactNode
  /** Optional: field path used for sorting (dot notation not needed, supply accessor) */
  sortAccessor?: (row: T) => string | number
  /** Hide this column on mobile */
  hideOnMobile?: boolean
  /** Column header alignment */
  align?: 'left' | 'center' | 'right'
  /** Fixed width class e.g. "w-16" */
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  /** Row key extractor */
  rowKey: (row: T) => string
  /** Show search bar */
  searchable?: boolean
  /** Which fields to include in search (dot-notation keys) */
  searchFields?: (row: T) => string
  /** Default rows per page */
  defaultPageSize?: number
  /** Slot rendered above the table (e.g. action buttons) */
  toolbar?: ReactNode
  /** Empty state message */
  emptyMessage?: string
  /** Loading skeleton */
  isLoading?: boolean
  /** Mobile: render a summary line under the first cell */
  mobileSubline?: (row: T) => ReactNode
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  rowKey,
  searchable = true,
  searchFields,
  defaultPageSize = 10,
  toolbar,
  emptyMessage = 'No records found.',
  isLoading = false,
  mobileSubline,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim() || !searchFields) return data
    const q = search.toLowerCase()
    return data.filter((row) => searchFields(row).toLowerCase().includes(q))
  }, [data, search, searchFields])

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortAccessor) return filtered
    return [...filtered].sort((a, b) => {
      const av = col.sortAccessor!(a)
      const bv = col.sortAccessor!(b)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir, columns])

  // ── Paginate ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar row */}
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

      {/* ── Desktop Table ─────────────────────────────────────────────────── */}
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
                      col.sortAccessor ? 'cursor-pointer select-none hover:text-foreground transition-colors' : '',
                    ].join(' ')}
                    onClick={() => col.sortAccessor && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {col.sortAccessor && (
                        <span className="text-muted-foreground/40">
                          {sortKey === col.key ? (
                            sortDir === 'asc' ? (
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
              ) : paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
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

      {/* ── Mobile Cards ──────────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : paged.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          paged.map((row) => {
            const visibleCols = columns.filter((c) => !c.hideOnMobile)
            const [first, ...rest] = visibleCols
            return (
              <div
                key={rowKey(row)}
                className="rounded-xl border border-border bg-card p-4 space-y-3"
              >
                {/* Primary row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {first?.cell(row)}
                    </div>
                    {mobileSubline && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {mobileSubline(row)}
                      </div>
                    )}
                  </div>
                  {/* Last visible column on right (usually actions) */}
                  {rest.length > 0 && (
                    <div className="shrink-0">{rest[rest.length - 1].cell(row)}</div>
                  )}
                </div>

                {/* Middle columns as key-value pairs */}
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

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground order-2 sm:order-1">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {sorted.length === 0
              ? '0 results'
              : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, sorted.length)} of ${sorted.length}`}
          </span>
        </div>

        <div className="flex items-center gap-1 order-1 sm:order-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage(1)}
            disabled={safePage === 1}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage(totalPages)}
            disabled={safePage === totalPages}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}