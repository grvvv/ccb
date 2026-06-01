import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

// ─── Shared error handler ─────────────────────────────────────────────────────

function onCartError(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError && error.response) {
    toast.error('Oops!', { description: error.response.data.message });
  } else {
    toast.error('Oops!', { description: fallbackMessage });
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantId = null,
    }: {
      productId: string;
      quantity: number;
      variantId?: string | null;
    }) => cartService.addToCart(productId, quantity, variantId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },

    onError: (error) => onCartError(error, 'Error adding to cart'),
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      variantId = null,
    }: {
      productId: string;
      quantity: number;
      variantId?: string | null;
    }) => cartService.updateQuantity(productId, quantity, variantId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },

    onError: (error) => onCartError(error, 'Error updating quantity'),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId = null,
    }: {
      productId: string;
      variantId?: string | null;
    }) => cartService.removeFromCart(productId, variantId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },

    onError: (error) => onCartError(error, 'Error removing from cart'),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),

    onSuccess: () => {
      // The backend always returns a cart (getOrCreateCart), so after clearing
      // the query will resolve to an empty cart — not null. Invalidate so the
      // fresh empty cart is fetched rather than leaving stale items visible.
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },

    onError: (error) => onCartError(error, 'Error clearing cart'),
  });
}