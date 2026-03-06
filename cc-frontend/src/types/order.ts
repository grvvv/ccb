export interface Address {
    name: string
    phone: string
    street: string
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

export interface OrderDetails {
    _id: string
    user: {
        _id: string
        name: string
        email: string
    }
    items: OrderItemDetails[]
    totalAmount: number
    paymentMethod: 'COD' | 'CARD' | 'UPI'
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
    orderStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    address: Address
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
    totalAmount: number
    paymentMethod: 'COD' | 'CARD' | 'UPI'
    address: Address
}