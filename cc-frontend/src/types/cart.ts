export interface CartItem {
  _id: string;
  product: string;
  name: string;
  image: string;
  price: number;
  sellingPrice: number;
  variantId: string | null;
  sku: string | null;
  attributes: Record<string, string>;
  quantity: number;
  weight: number;
}

export interface CartDetails {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  weight: number;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartResponse {
  message: string;
  result: CartDetails;
}