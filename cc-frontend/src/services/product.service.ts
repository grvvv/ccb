import { BaseApiClient } from "@/lib/api";
import type { UpdateUserCredentials } from "@/types/auth";
import type { CreateProductFormDetails, ProductDetails, ProductList } from "@/types/product";

class ProductService extends BaseApiClient {
  async getById(productId: string): Promise<ProductDetails> {
    return this.get<ProductDetails>(`product/${productId}/`);
  }

  async create(data: CreateProductFormDetails): Promise<ProductDetails> {
    return this.post<ProductDetails>(`product/add`, data);
  }

  async update(productId: string, data: UpdateUserCredentials): Promise<ProductDetails> {
    return this.patch<ProductDetails>(`product/update/${productId}/`, data);
  }

  async list(params?: { page?: number; limit?: number; search?: string, category?: string }): Promise<ProductList> {
    return this.get<ProductList>('product/', params);
  }

  async deleteById(productId: string): Promise<void> {
    return this.delete<void>(`product/delete/${productId}/`);
  }
}

export const productService = new ProductService();