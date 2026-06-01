export interface VariantOption {
  _id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  _id: string;
  sku: string;
  attributes: Record<string, string>;
  stock: number;
  price?: number;
  sellingPrice?: number;
  weight?: number;
  dimensions?: Dimensions;
}

export interface ProductDetails {
  _id: string;
  name: string;
  category: string;
  thumbnail: string;
  productImages: string[];
  description?: string;
  slug: string;
  stock: number;
  price: number;
  sellingPrice: number;
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  weight: number;
  dimensions: Dimensions;
  isCODAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasVariants?: boolean;
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
    isCODAvailable: boolean
    images: File[]
}

export interface ProductList {
    result: ProductDetails[];
    total: number;
    page: number;
    pages: number;
}