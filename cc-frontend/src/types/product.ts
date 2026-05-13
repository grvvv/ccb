export interface ProductDetails {
  _id: string;
  name: string;
  category: string;
  thumbnail: string;
  productImages: string[];
  description: string;
  slug: string;
  price: number;
  sellingPrice: number;
  b2bPricingTiers: B2BTier[];
  sku: string;
  stock: number;
  weight: string;
  dimensions: Dimensions
  isCODAvailable: boolean;
  created_at: string;
  updated_at: string;
}


export interface B2BTier {
  minQty: number
  maxQty: number | null
  price: number
}

export interface Dimensions {
  length: number
  width: number
  height: number
}

export interface CreateProductFormDetails {
    name: string
    category: string
    description: string
    price: number
    sellingPrice: number
    sku: string
    stock: number
    weight: number
    dimensions: Dimensions
    b2bPricingTiers: B2BTier[]
    isCODAvailable: boolean
    images: File[]
}

export interface ProductList {
    result: ProductDetails[];
    total: number;
    page: number;
    pages: number;
}