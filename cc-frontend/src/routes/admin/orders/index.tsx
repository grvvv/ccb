import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrders } from '@/hooks/user-order'
import type { OrderDetails } from '@/types/order'
import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Search,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'

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

function OrderCard({ order }: { order: OrderDetails }) {
  const orderStatusConfig =
    statusConfig.orderStatus[
      order.orderStatus as keyof typeof statusConfig.orderStatus
    ] ?? statusConfig.orderStatus.PLACED

  const paymentStatusConfig =
    statusConfig.paymentStatus[
      order.paymentStatus as keyof typeof statusConfig.paymentStatus
    ] ?? statusConfig.paymentStatus.CREATED

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="transition-all border-border hover:shadow-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-xs font-mono text-muted-foreground">
                ORDER #{order._id.slice(-8).toUpperCase()}
              </p>

              <Badge
                variant="outline"
                className={`text-[10px] ${orderStatusConfig.className}`}
              >
                {orderStatusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </div>
          </div>

        </div>

        {/* Customer + Address */}
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <User className="h-3 w-3" />
              Customer
            </div>

            <p className="text-sm font-medium">
              {order.user?.name || 'Unknown User'}
            </p>

            <p className="text-xs text-muted-foreground">
              {order.user?.email || 'No email'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Delivery Address
            </div>

            <p className="text-sm font-medium">
              {order.address?.name}
            </p>

            <p className="text-xs text-muted-foreground">
              {order.address?.address}, {order.address?.locality}, {order.address?.city}
            </p>

            <p className="text-xs text-muted-foreground">
              {order.address?.state} - {order.address?.pincode}
            </p>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {order.address?.phone}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Items ({order.items.length})
            </p>

            <p className="text-xs text-muted-foreground">
              {order.items.reduce((acc, item) => acc + item.quantity, 0)} units
            </p>
          </div>

          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={`${item.product}-${item.quantity}`}
                className="flex items-center justify-between gap-4 rounded-lg bg-secondary p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.name}
                  </p>

                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      ₹{item.sellingPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-primary">
                    ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                  </p>

                  {item.price !== item.sellingPrice && (
                    <p className="text-xs line-through text-muted-foreground">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="rounded-lg bg-secondary p-4 space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>

            <span>
              ₹{order.subtotalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>

            <span>
              ₹{order.shippingAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />

            <Badge
              variant="outline"
              className={`text-[10px] ${paymentStatusConfig.className}`}
            >
              {paymentStatusConfig.label}
            </Badge>
          </div>

          <div className="text-right">
            <p className="mb-0.5 text-xs text-muted-foreground">
              Total Amount
            </p>

            <p className="text-lg font-bold text-primary">
              ₹{order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: ordersData, isLoading } = useOrders({
    page: 1,
    limit: 10,
  })

  const orders = ordersData?.result ?? []
  const total = ordersData?.total ?? 0

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'all' ||
        order.orderStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Orders
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage and track all customer orders
              </p>
            </div>

            <Badge variant="outline" className="w-fit text-xs">
              {total} Total Orders
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Orders
                </SelectItem>

                <SelectItem value="PLACED">
                  Placed
                </SelectItem>

                <SelectItem value="CONFIRMED">
                  Confirmed
                </SelectItem>

                <SelectItem value="SHIPPED">
                  Shipped
                </SelectItem>

                <SelectItem value="DELIVERED">
                  Delivered
                </SelectItem>

                <SelectItem value="CANCELLED">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <Package className="mb-4 h-16 w-16 opacity-50" />

            <p className="mb-1 text-lg font-medium">
              No orders found
            </p>

            <p className="text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
