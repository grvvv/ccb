import { BaseApiClient } from "@/lib/api";
import type { CartResponse } from "@/types/cart";

class CartService extends BaseApiClient {
  async getCart(): Promise<CartResponse> {
    return this.get<CartResponse>(`cart/all`);
  }

  async addToCart(productId: string, quantity: number, variantId: string | null): Promise<CartResponse> {
    return this.post<CartResponse>(`cart/add`, { productId, quantity, variantId });
  }

  async updateQuantity(productId: string, quantity: number, variantId: string | null): Promise<CartResponse> {
    return this.put<CartResponse>(`cart/update`, { productId, quantity, variantId });
  }

  async removeFromCart(id: string, variantId: string | null): Promise<CartResponse> {
    return this.delete<CartResponse>(`cart/remove/${id}?variantId=${variantId}`);
  }

  async clearCart(): Promise<void> {
    return this.delete<void>(`cart/clear`);
  }
}

export const cartService = new CartService();