export interface CartItem {
  _id: string;
  name: string;
  product: string;
  price: number;
  sellingPrice: number;
  image: string;
  quantity: number;
};
  
export interface CartDetails {
    _id: string
    user: string
    items: CartItem[]
    totalItems: number
    totalAmount: number
    subtotalAmount: number
    shippingAmount: number
}

export interface CartResponse {
    message: string
    result: CartDetails
}
