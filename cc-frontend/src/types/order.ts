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
    product: {
        _id: string
        name: string
    },
    name: string
    quantity: number
    price: number
    sellingPrice: number
    _id: string
}

export interface CreateOrderResponse {
    order: OrderItemDetails,
    razorpayOrder: RazorpayOrder
}

export interface OrderDetails {
    _id: string
    user: {
        _id: string
        name: string
        email: string
    }
    items: OrderItemDetails[]
    totalAmount: number
    subtotalAmount: number,
    shippingAmount: number,
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
    orderStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    address: Address
    razorpayOrderId?: string
    createdAt: string
    updatedAt: string
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