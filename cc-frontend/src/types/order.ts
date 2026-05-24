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
    quantity: number
}

export interface OrderItemDetails {
    product: string
    name: string
    quantity: number
    price: number
    image: string
    sellingPrice: number
    _id: string
}

export interface CreateOrderResponse {
    order: OrderItemDetails,
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
    totalAmount: number
    shippingAmount: number
    subtotalAmount: number
    address: Address
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    razorpayOrderId: string | null
    razorpayPaymentId: string | null
    razorpaySignature: string | null
    createdAt: string
    updatedAt: string
    __v: number
}

export interface OrderDetailsResponse {
    result: OrderDetails
    message: string
}

export interface OrderList {
    result: OrderDetails[];
    total: number;
    page: number;
    pages: number;
}

export interface OrderFormData {
    items: OrderItem[]
    address: Address
}