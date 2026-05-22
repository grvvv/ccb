import { BaseApiClient } from "@/lib/api";
import type { CartResponse } from "@/types/cart";

class CartService extends BaseApiClient {
  async getCart(): Promise<CartResponse> {
    return this.get<CartResponse>(`cart/all`);
  }

  async addToCart(productId: string, quantity: number): Promise<CartResponse> {
    return this.post<CartResponse>(`cart/add`, { productId, quantity });
  }

  async updateQuantity(productId: string, quantity: number): Promise<CartResponse> {
    return this.put<CartResponse>(`cart/update`, { productId, quantity });
  }

  async removeFromCart(id: string): Promise<CartResponse> {
    return this.delete<CartResponse>(`cart/remove/${id}`);
  }

  async clearCart(): Promise<void> {
    return this.delete<void>(`cart/clear`);
  }
}

export const cartService = new CartService();