// routes/_public/(customer)/orders.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrders } from "@/hooks/user-order";
import type { OrderDetails } from "@/types/order";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  MapPin,
  Package,
  Phone,
  Search,
  User,
  IndianRupee,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_public/(customer)/orders")({
  component: OrdersPage,
});

const orderStatusConfig = {
  PLACED: {
    label: "Placed",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

const paymentStatusConfig = {
  CREATED: {
    label: "Created",
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  },
  PAID: {
    label: "Paid",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderCard({ order }: { order: OrderDetails }) {
  const orderStatus =
    orderStatusConfig[
    order.orderStatus as keyof typeof orderStatusConfig
    ] || {
      label: order.orderStatus,
      className: 'bg-muted text-muted-foreground'
    }

  const paymentStatus =
    paymentStatusConfig[
    order.paymentStatus as keyof typeof paymentStatusConfig
    ] || {
      label: order.paymentStatus,
      className: 'bg-muted text-muted-foreground'
    }

  const subtotal =
    order.items?.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0,
    ) || 0;

  const shipping = order.totalAmount - subtotal;

  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer"
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-mono text-xs text-muted-foreground">
                ORDER #{order._id.slice(-8).toUpperCase()}
              </p>

              <Badge
                variant="outline"
                className={`text-[10px] ${orderStatus.className}`}
              >
                {orderStatus.label}
              </Badge>

              <Badge
                variant="outline"
                className={`text-[10px] ${paymentStatus.className}`}
              >
                {paymentStatus.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-2 gap-6 py-5">
          {/* Customer */}
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2">
              <User className="h-3 w-3" />
              Customer
            </div>

            <p className="text-sm font-medium">
              {order.user?.name || "Unknown User"}
            </p>

            <p className="text-xs text-muted-foreground">
              {order.user?.email || "No email"}
            </p>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              Delivery Address
            </div>

            <p className="text-sm font-medium">{order.address?.name}</p>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {[
                order.address?.address,
                order.address?.locality,
                order.address?.city,
                order.address?.state,
                order.address?.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>

            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {order.address?.phone}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Items ({order.items.length})
            </p>

            <p className="text-xs text-muted-foreground">
              Shipping: {formatPrice(shipping)}
            </p>
          </div>

          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div
                key={`${item.product}-${index}`}
                className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>

                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(item.sellingPrice * item.quantity)}
                  </p>

                  {item.price !== item.sellingPrice && (
                    <p className="text-xs line-through text-muted-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <IndianRupee className="h-3 w-3" />
            Razorpay Payment
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Amount</p>

            <p className="text-lg font-bold text-primary">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useMyOrders({
    page: 1,
    limit: 20,
  });

  const orders = data?.result || [];
  const total = data?.total || 0;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        order._id.toLowerCase().includes(search) ||
        order.user?.name?.toLowerCase().includes(search) ||
        order.user?.email?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">My Orders</h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Track and manage your orders
              </p>
            </div>

            <Badge variant="outline">{total} Orders</Badge>
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="Status" />
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

      {/* Orders */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="mb-4 h-14 w-14 text-muted-foreground/50" />

            <p className="text-lg font-medium">No orders found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
