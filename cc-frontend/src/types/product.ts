export interface ProductDetails {
  _id: string;
  name: string;
  category: string;
  productImages: string[];
  description: string;
  price: number;
  sellingPrice: number;
  thumbnail: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductFormDetails {
    name: string,
    category: string;
    description: string;
    price: number;
    sellingPrice: number;
    images: File[];
}

export interface ProductList {
    result: ProductDetails[];
    total: number;
    page: number;
    pages: number;
}