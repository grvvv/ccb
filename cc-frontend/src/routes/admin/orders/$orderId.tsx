import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrderDetails, useUpdateOrder } from '@/hooks/user-order'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import {
    ArrowLeft,
    ArrowUpRight,
    Calendar,
    CreditCard,
    MapPin,
    Package,
    Phone,
    User,
    Loader2,
    Hash,
    ShoppingBag,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/orders/$orderId')({
    component: OrderViewPage,
})

const ORDER_STATUSES = [
    { value: 'PLACED', label: 'Placed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    { value: 'CONFIRMED', label: 'Confirmed', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    { value: 'SHIPPED', label: 'Shipped', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
    { value: 'DELIVERED', label: 'Delivered', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    { value: 'CANCELLED', label: 'Cancelled', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
] as const

const PAYMENT_STATUSES = [
    { value: 'CREATED', label: 'Created', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' },
    { value: 'PAID', label: 'Paid', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
    { value: 'FAILED', label: 'Failed', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
    { value: 'REFUNDED', label: 'Refunded', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
] as const

type OrderStatus = (typeof ORDER_STATUSES)[number]['value']

const getOrderStatus = (v: string) => ORDER_STATUSES.find((s) => s.value === v) ?? ORDER_STATUSES[0]
const getPaymentStatus = (v: string | null) => PAYMENT_STATUSES.find((s) => s.value === v) ?? null

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

function OrderViewPage() {
    const { orderId } = Route.useParams()
    const navigate = useNavigate()

    const { data, isLoading, isError } = useOrderDetails(orderId)
    const { mutate: updateOrder, isPending } = useUpdateOrder()
    const order = data?.result
    const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)

    const currentOrderStatus = orderStatus ?? (order?.orderStatus as OrderStatus)
    const isDirty = orderStatus !== null && orderStatus !== order?.orderStatus

    const handleSave = () => {
        if (!isDirty) return
        updateOrder(
            { orderId, orderData: { orderStatus } },
            {
                onSuccess: () => {
                    toast.success('Order status updated')
                    setOrderStatus(null)
                },
                onError: () => toast.error('Failed to update order'),
            },
        )
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="border-b border-border bg-card">
                    <div className="mx-auto max-w-4xl px-6 py-5">
                        <Skeleton className="h-4 w-20 mb-4" />
                        <Skeleton className="h-7 w-52 mb-1" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                </div>
                <div className="mx-auto max-w-4xl px-6 py-8 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (isError || !order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Package className="h-16 w-16 opacity-40" />
                <p className="text-lg font-medium">Order not found</p>
                <Button variant="outline" size="sm" onClick={() => navigate({ to: '/admin/orders' })}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
                </Button>
            </div>
        )
    }

    const orderStatusCfg = getOrderStatus(currentOrderStatus)
    const paymentStatusCfg = getPaymentStatus(order.paymentStatus)

    return (
        <div className="min-h-screen bg-background">
            {/* ── Sticky Header ───────────────────────────────────────────────── */}
            <div className="border-b border-border bg-card sticky top-0 z-10">
                <div className="mx-auto max-w-6xl px-6 py-5">
                    <button
                        onClick={() => navigate({ to: '/admin/orders' })}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-semibold text-foreground">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                </h1>
                                <Badge variant="outline" className={`text-[10px] ${orderStatusCfg.className}`}>
                                    {orderStatusCfg.label}
                                </Badge>
                                {paymentStatusCfg && (
                                    <Badge variant="outline" className={`text-[10px] ${paymentStatusCfg.className}`}>
                                        {paymentStatusCfg.label}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(order.createdAt)}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isDirty && (
                                <Button variant="outline" size="sm" onClick={() => setOrderStatus(null)}>
                                    Discard
                                </Button>
                            )}
                            <Button size="sm" onClick={handleSave} disabled={!isDirty || isPending}>
                                {isPending && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8 space-y-5">
                {/* ── Order Status Control ────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Update Order Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Select
                                value={currentOrderStatus}
                                onValueChange={(v) => setOrderStatus(v as OrderStatus)}
                            >
                                <SelectTrigger className="w-full sm:w-56">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ORDER_STATUSES.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            <span className="flex items-center gap-2">
                                                {s.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Visual pipeline */}
                            <div className="flex items-center gap-1 flex-wrap">
                                {ORDER_STATUSES.map((s, i) => {
                                    const statuses = ORDER_STATUSES.map((x) => x.value)
                                    const currentIdx = statuses.indexOf(currentOrderStatus)
                                    const isActive = i === currentIdx
                                    const isPast = i < currentIdx && currentOrderStatus !== 'CANCELLED'
                                    const isCancelled = currentOrderStatus === 'CANCELLED'

                                    return (
                                        <div key={s.value} className="flex items-center gap-1">
                                            <span
                                                className={[
                                                    'text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all',
                                                    isActive
                                                        ? s.className
                                                        : isPast
                                                            ? 'bg-muted text-muted-foreground border-border opacity-60'
                                                            : isCancelled && s.value !== 'CANCELLED'
                                                                ? 'bg-muted text-muted-foreground border-border opacity-30'
                                                                : 'bg-muted text-muted-foreground border-border opacity-40',
                                                ].join(' ')}
                                            >
                                                {s.label}
                                            </span>
                                            {i < ORDER_STATUSES.length - 1 && (
                                                <span className="text-muted-foreground/30 text-xs">→</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Customer + Address ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <User className="h-3.5 w-3.5" /> Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium">{order.user?.name ?? 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{order.user?.email ?? '—'}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                                ID: {order.user?._id?.slice(-8).toUpperCase() ?? '—'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" /> Delivery Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p className="font-medium">{order.address?.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {order.address?.address}, {order.address?.locality}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {order.address?.city}, {order.address?.state} – {order.address?.pincode}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                <Phone className="h-3 w-3" />
                                {order.address?.phone}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Items ───────────────────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <ShoppingBag className="h-3.5 w-3.5" /> Items
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                {order.items.length} product{order.items.length !== 1 ? 's' : ''} ·{' '}
                                {order.items.reduce((acc, i) => acc + i.quantity, 0)} units
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {order.items.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3"
                            >
                                {/* Product image */}
                                <div className="h-14 w-14 shrink-0 rounded-md border border-border overflow-hidden bg-background">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                            <Package className="h-5 w-5 opacity-40" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {item.name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    ₹{item.sellingPrice.toFixed(2)} each
                                                </p>
                                                {item.price !== item.sellingPrice && (
                                                    <p className="text-xs line-through text-muted-foreground">
                                                        MRP ₹{item.price.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price + link */}
                                        <div className="text-right shrink-0 space-y-1">
                                            <p className="text-sm font-semibold text-primary">
                                                ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                                            </p>
                                            {item.product && (
                                                <Link
                                                    to="/products/$productId"
                                                    params={{ productId: item.product }}
                                                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    View product
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                            {!item.product && (
                                                <p className="text-[10px] text-muted-foreground italic">
                                                    Product deleted
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5" /> Payment Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{order.subtotalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>
                                    {order.shippingAmount === 0
                                        ? <span className="text-green-600 text-xs font-medium">Free</span>
                                        : `₹${order.shippingAmount.toFixed(2)}`}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total</span>
                                <span className="text-lg font-bold text-primary">
                                    ₹{order.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Razorpay IDs */}
                        {(order.razorpayOrderId || order.razorpayPaymentId) && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    {order.razorpayOrderId && (
                                        <div className="flex items-start justify-between gap-4 text-xs">
                                            <span className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                                                <Hash className="h-3 w-3" /> Razorpay Order
                                            </span>
                                            <span className="font-mono text-foreground break-all text-right">
                                                {order.razorpayOrderId}
                                            </span>
                                        </div>
                                    )}
                                    {order.razorpayPaymentId && (
                                        <div className="flex items-start justify-between gap-4 text-xs">
                                            <span className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                                                <Hash className="h-3 w-3" /> Payment ID
                                            </span>
                                            <span className="font-mono text-foreground break-all text-right">
                                                {order.razorpayPaymentId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Payment status badge */}
                        {paymentStatusCfg && (
                            <>
                                <Separator />
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Payment Status</span>
                                    <Badge variant="outline" className={`text-[10px] ${paymentStatusCfg.className}`}>
                                        {paymentStatusCfg.label}
                                    </Badge>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}