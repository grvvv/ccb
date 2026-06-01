import type { RazorpayOrder } from "./razorpay"

export interface Address {
    _id?: string
    name: string
    phone: string
    address: string
    locality: string
    type: string
    city: string
    state: string
    pincode: string
}

export interface OrderItem {
    productId: string
    variantId?: string | null
    quantity: number
}

export interface OrderItemDetails {
    product: string
    variantId: string | null
    sku: string | null
    attributes: Record<string, string>
    name: string
    image: string
    price: number
    sellingPrice: number
    quantity: number
    weight: number
}

export interface CreateOrderResponse {
    order: OrderDetails,
    razorpayOrder: RazorpayOrder
}


export interface OrderUser {
    _id: string
    name: string
    email: string
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED'


export interface OrderDetails {
    _id: string
    user: OrderUser
    items: OrderItemDetails[]
    subtotalAmount: number
    shippingAmount: number
    totalAmount: number
    totalWeight: number
    address: Address
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    razorpayOrderId: string
    razorpayPaymentId: string | null
    razorpaySignature: string | null
    createdAt: string
    updatedAt: string
}

export interface OrderDetailsResponse {
    result: OrderDetails
    message: string
}

export interface OrderList {
    message: string
    result: OrderDetails[]
    total: number
    page: number
    pages: number
}

export interface OrderFormData {
    address: Address
}