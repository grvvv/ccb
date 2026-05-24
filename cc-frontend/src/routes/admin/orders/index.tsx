import { Badge } from '@/components/ui/badge'
import { useOrders } from '@/hooks/user-order'
import type { OrderDetails } from '@/types/order'
import { createFileRoute } from '@tanstack/react-router'
import { Package } from 'lucide-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type ColumnDef } from '@/components/shared/data-display/data-table'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders/')({
  component: OrdersPage,
})

const statusConfig = {
  orderStatus: {
    PLACED: {
      label: 'Placed',
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    CONFIRMED: {
      label: 'Confirmed',
      className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    },
    SHIPPED: {
      label: 'Shipped',
      className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    },
    DELIVERED: {
      label: 'Delivered',
      className: 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    CANCELLED: {
      label: 'Cancelled',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
    },
  },
  paymentStatus: {
    CREATED: {
      label: 'Created',
      className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    },
    PAID: {
      label: 'Paid',
      className: 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    FAILED: {
      label: 'Failed',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
    },
    REFUNDED: {
      label: 'Refunded',
      className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    },
  },
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const columns: ColumnDef<OrderDetails>[] = [
  {
    key: 'orderId',
    header: 'Order',
    sortAccessor: (row) => row._id,
    cell: (row) => (
      <div>
        <p className="text-xs font-mono text-foreground">
          #{row._id.slice(-8).toUpperCase()}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(row.createdAt)}
        </p>
      </div>
    ),
  },
  {
    key: 'customer',
    header: 'Customer',
    hideOnMobile: true,
    sortAccessor: (row) => row.user?.name ?? '',
    cell: (row) => (
      <div>
        <p className="text-sm font-medium text-foreground">
          {row.user?.name ?? 'Unknown'}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.user?.email ?? '—'}
        </p>
      </div>
    ),
  },
  {
    key: 'address',
    header: 'Delivery',
    hideOnMobile: true,
    cell: (row) => (
      <div className="text-xs text-muted-foreground space-y-0.5 max-w-[180px]">
        <p className="font-medium text-foreground">{row.address?.name}</p>
        <p className="truncate">
          {row.address?.locality}, {row.address?.city}
        </p>
        <p>
          {row.address?.state} – {row.address?.pincode}
        </p>
      </div>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    hideOnMobile: true,
    align: 'center',
    width: 'w-20',
    cell: (row) => (
      <div className="text-center">
        <p className="text-sm font-medium">{row.items.length}</p>
        <p className="text-xs text-muted-foreground">
          {row.items.reduce((acc, i) => acc + i.quantity, 0)} units
        </p>
      </div>
    ),
  },
  {
    key: 'orderStatus',
    header: 'Order Status',
    sortAccessor: (row) => row.orderStatus,
    cell: (row) => {
      const cfg =
        statusConfig.orderStatus[
          row.orderStatus as keyof typeof statusConfig.orderStatus
        ] ?? statusConfig.orderStatus.PLACED
      return (
        <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    key: 'paymentStatus',
    header: 'Payment',
    hideOnMobile: true,
    sortAccessor: (row) => row.paymentStatus,
    cell: (row) => {
      const cfg =
        statusConfig.paymentStatus[
          row.paymentStatus as keyof typeof statusConfig.paymentStatus
        ] ?? statusConfig.paymentStatus.CREATED
      return (
        <Badge variant="outline" className={`text-[10px] ${cfg.className}`}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    sortAccessor: (row) => row.totalAmount,
    cell: (row) => (
      <div className="text-right">
        <p className="text-sm font-semibold text-primary">
          ₹{row.totalAmount.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          +₹{row.shippingAmount.toFixed(2)} ship
        </p>
      </div>
    ),
  },
]

function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: ordersData, isLoading } = useOrders({ page: 1, limit: 100 })
  const orders = ordersData?.result ?? []
  const total = ordersData?.total ?? 0
  const navigate = useNavigate()

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage and track all customer orders
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-xs">
              {total} Total Orders
            </Badge>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <Package className="mb-4 h-16 w-16 opacity-50" />
            <p className="mb-1 text-lg font-medium">No orders found</p>
            <p className="text-sm">Orders will appear here once customers place them</p>
          </div>
        ) : (
          <DataTable
            data={filteredOrders}
            onRowClick={(row) => navigate({ to: '/admin/orders/$orderId', params: { orderId: row._id } })}
            columns={columns}
            rowKey={(row) => row._id}
            searchable
            searchFields={(row) =>
              [
                row._id,
                row.user?.name ?? '',
                row.user?.email ?? '',
              ].join(' ')
            }
            defaultPageSize={10}
            isLoading={isLoading}
            emptyMessage="No orders match your search or filter."
            mobileSubline={(row) => row.user?.email ?? ''}
            toolbar={
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-40 text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="PLACED">Placed</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        )}
      </div>
    </div>
  )
}