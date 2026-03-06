// routes/admin/orders/index.tsx

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Search,
  User,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_public/(customer)/orders')({
  component: OrdersPage,
})

// Status badge configurations
const statusConfig = {
  orderStatus: {
    PLACED: { label: 'Placed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    CONFIRMED: { label: 'Confirmed', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    SHIPPED: { label: 'Shipped', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
    DELIVERED: { label: 'Delivered', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  },
  paymentStatus: {
    PENDING: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' },
    PAID: { label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    FAILED: { label: 'Failed', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  },
  paymentMethod: {
    COD: { label: 'Cash on Delivery', icon: Package },
    CARD: { label: 'Card Payment', icon: CreditCard },
    UPI: { label: 'UPI Payment', icon: CreditCard },
  },
}

function OrderCard({ order }: { order: OrderDetails }) {
  const orderStatusConfig = statusConfig.orderStatus[order.orderStatus]
  const paymentStatusConfig = statusConfig.paymentStatus[order.paymentStatus]
  const PaymentIcon = statusConfig.paymentMethod[order.paymentMethod].icon

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-mono text-muted-foreground">ORDER #{order._id.slice(-8).toUpperCase()}</p>
              <Badge variant="outline" className={"text-[10px] ${orderStatusConfig.className}"}>
                {orderStatusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Customer & Address */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-1">
              <User className="h-3 w-3" />
              Customer
            </div>
            <p className="text-sm font-medium">{order.user.name}</p>
            <p className="text-xs text-muted-foreground">{order.user.email}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-1">
              <MapPin className="h-3 w-3" />
              Delivery Address
            </div>
            <p className="text-sm font-medium">{order.address.name}</p>
            <p className="text-xs text-muted-foreground">
              {order.address.street}, {order.address.city}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.address.state} - {order.address.pincode}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {order.address.phone}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Items ({order.items.length})
          </p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center justify-between py-2 px-3 bg-secondary rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    ${(item.sellingPrice * item.quantity).toFixed(2)}
                  </p>
                  {item.price !== item.sellingPrice && (
                    <p className="text-xs text-muted-foreground line-through">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <PaymentIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {statusConfig.paymentMethod[order.paymentMethod].label}
              </span>
            </div>
            <Badge variant="outline" className={"text-[10px] ${paymentStatusConfig.className}"}>
              {paymentStatusConfig.label}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
            <p className="text-lg font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data - replace with your API call
  const {data: ordersData, isLoading} = useOrders({ page: 1, limit: 10 })
  
  const orders = ordersData?.result ?? []
  const total = ordersData?.total ?? 0 
  // const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track all customer orders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {total} Total Orders
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] border-border">
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
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Package className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">No orders found</p>
            <p className="text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination - if needed */}
        {/* {ordersData.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="sm" disabled={ordersData.page === 1}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {ordersData.page} of {ordersData.pages}
            </span>
            <Button variant="outline" size="sm" disabled={ordersData.page === ordersData.pages}>
              Next
            </Button>
          </div>
        )} */}
      </div>
    </div>
  )
}