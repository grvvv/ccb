// routes/checkout/create-order.tsx

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Loader2,
  Minus,
  Plus,
  Trash2
} from 'lucide-react'
import { useCart, useUpdateCartQuantity, useRemoveFromCart, useClearCart } from '@/hooks/use-cart'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { orderService } from '@/services/order.service'
import { paymentService, loadRazorpayScript } from '@/services/payment.service'
import type { Address, OrderFormData } from '@/types/order'
import '@/types/razorpay.d.ts'
import { useMyProfile } from '@/hooks/use-user'
import { AddressSelector } from '@/components/features/checkout/address-selector'
import { toast } from 'sonner'

export const Route = createFileRoute('/_public/(customer)/checkout')({
  component: CreateOrder,
})

function CreateOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const router = useRouter()

  const { data } = useCart()
  let cartItems = data?.result?.items || []
  const subtotal = data?.result?.subtotalAmount || 0
  const shipping = data?.result?.shippingAmount || 0
  const total = data?.result?.totalAmount || 0
  const updateQtyMutation = useUpdateCartQuantity()
  const removeMutation = useRemoveFromCart()
  const clearCartMutation = useClearCart()

  const { data: profile } = useMyProfile()
  const addresses = profile?.addresses || []
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>()

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return
    updateQtyMutation.mutate({ productId: id, quantity: newQty })
  }
  const removeItem = (id: string) => {
    removeMutation.mutate(id)
  }

  const savings = 0 // if not tracked in cartStore
  const isAddressValid = !!selectedAddress

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAddressValid || cartItems.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData: OrderFormData = {
        items: cartItems.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
        })),
        address: selectedAddress!,
      }

      let { order, razorpayOrder } = await orderService.create(orderData)
      const loaded = await loadRazorpayScript();

      if (!loaded) throw new Error("Failed to load Razorpay");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Crafty Cakes",
        description: `Order #${order._id}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: selectedAddress?.name,
          contact: selectedAddress?.phone,
        },
        handler: async (paymentResponse: any) => {
          const verification = await paymentService.verifyPayment({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            appOrderId: order._id,
          });

          if (verification.success) {
            clearCartMutation.mutate();
            router.navigate({
              to: "/orders",
            });
          }
        },

        modal: {
          ondismiss: async () => {
            try {
              await orderService.cancelUnpaidOrder(order._id);
              toast.warning("Payment Cancelled")
            } catch (error) {
              toast.error("Error deleting cancelled order");
            }
          },
        },

      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.log(error)
      setPaymentError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Checkout</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your order and complete payment
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 sm:grid-cols-1 gap-6 ">
            {/* Left Column - Cart & Address */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* Cart Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    Order Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-4 sm:px-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {cartItems.map((item) => {
                        return (
                          <div key={item._id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                            {/* Image */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Right side */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              {/* Name + remove */}
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                                  {item.name}
                                </h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive -mt-0.5"
                                  onClick={() => removeItem(item.product)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              {/* Price row */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-primary tabular-nums">
                                  ₹{item.sellingPrice.toFixed(2)}
                                </span>
                                {item.sellingPrice !== item.price && (
                                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                                    ₹{item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              {/* Qty + line total */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-none border-0"
                                    onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-7 text-center text-xs font-medium tabular-nums select-none">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-none border-0"
                                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <span className="text-xs text-muted-foreground tabular-nums">
                                  Total:{' '}
                                  <span className="font-semibold text-foreground">
                                    ₹{subtotal.toFixed(2)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <AddressSelector
                addresses={addresses}
                value={selectedAddress}
                onChange={setSelectedAddress}
              />

            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings</span>
                        <span className="font-medium">-₹{savings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-green-600">₹{shipping.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary text-lg">₹{total.toFixed(2)}</span>
                  </div>

                  {/* Payment Error */}
                  {paymentError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {paymentError}
                    </div>
                  )}

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!selectedAddress || cartItems.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : ('Pay Now')}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    By placing this order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}