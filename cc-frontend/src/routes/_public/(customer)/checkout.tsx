// routes/checkout/create-order.tsx

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  Smartphone,
  Wallet,
  Loader2,
  Minus,
  Plus,
  Trash2
} from 'lucide-react'
import { useCart, useUpdateCartQty, useRemoveFromCart, useClearCart } from '@/hooks/use-cart'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { orderService } from '@/services/order.service'
import type { Address, OrderFormData } from '@/types/order'

export const Route = createFileRoute('/_public/(customer)/checkout')({
  component: CreateOrder,
})

function CreateOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const { data: cartItems = [] } = useCart()
  const updateQtyMutation = useUpdateCartQty()
  const removeMutation = useRemoveFromCart()
  const clearCartMutation = useClearCart()

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'UPI'>('COD')
  const [address, setAddress] = useState<Address>({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  })

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return
    updateQtyMutation.mutate({ id, quantity: newQty })
  }

  const removeItem = (id: string) => {
    removeMutation.mutate(id)
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0
  )
  const savings = 0 // if not tracked in cartStore
  const total = subtotal

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const isAddressValid = Object.values(address).every((val) => val.trim() !== '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAddressValid || cartItems.length === 0) return

    setIsSubmitting(true)

    try {
      const orderData : OrderFormData = {
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        totalAmount: total,
        paymentMethod,
        address,
      }

      console.log('Order Data:', orderData)
      await orderService.create(orderData)

      clearCartMutation.mutate()
      router.navigate({ to: '/orders' })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    Order Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id}>
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                          <img
                            src={item.productImages?.[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-primary">
                              ₹{item.sellingPrice.toFixed(2)}
                            </span>
                            {item.sellingPrice !== item.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{item.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border border-border rounded-lg">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-3 text-sm font-medium min-w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground ml-auto">
                              Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* {index < cartItems.length - 1 && <Separator className="mt-4" />} */}
                    </div>
                  ))}

                  {cartItems.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Your cart is empty</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wide">
                        Full Name <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={address.name}
                        onChange={(e) => handleAddressChange('name', e.target.value)}
                        className="border-border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide">
                        Phone Number <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={address.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        className="border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-xs font-medium uppercase tracking-wide">
                      Street Address <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street, Apt 4B"
                      value={address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="border-border"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-medium uppercase tracking-wide">
                        City <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="border-border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-xs font-medium uppercase tracking-wide">
                        State <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="border-border"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-xs font-medium uppercase tracking-wide">
                        Pincode <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        placeholder="10001"
                        value={address.pincode}
                        onChange={(e) => handleAddressChange('pincode', e.target.value)}
                        className="border-border"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as any)}>
                    <div className="space-y-3">
                      {/* COD */}
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'COD'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="COD" id="cod" />
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Cash on Delivery</p>
                          <p className="text-xs text-muted-foreground">Pay when you receive</p>
                        </div>
                      </label>

                      {/* CARD */}
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'CARD'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="CARD" id="card" />
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Credit / Debit Card</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                        </div>
                      </label>

                      {/* UPI */}
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'UPI'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="UPI" id="upi" />
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">UPI Payment</p>
                          <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
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
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary text-lg">₹{total.toFixed(2)}</span>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!isAddressValid || cartItems.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
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