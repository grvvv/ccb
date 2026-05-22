import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cartService } from '@/services/cart.service';

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: {
      productId: string;
      quantity: number;
    }) => cartService.addToCart(productId, quantity),

    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data.result);
      queryClient.invalidateQueries({queryKey: ['cart']});
    },

    onError: (error) => {
      console.error('Failed to add to cart:', error);
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({productId,quantity}: {
      productId: string;
      quantity: number;
    }) => cartService.updateQuantity(productId, quantity),

    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data.result);
      queryClient.invalidateQueries({ queryKey: ['cart'],});
    },

    onError: (error) => {
      console.error('Failed to update cart quantity:', error);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => cartService.removeFromCart(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'],data.result);
      queryClient.invalidateQueries({queryKey: ['cart']});
    },

    onError: (error) => {
      console.error('Failed to remove cart item:', error);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.setQueryData(['cart'],null);
      queryClient.invalidateQueries({queryKey: ['cart'],});
    },

    onError: (error) => {
      console.error('Failed to clear cart:', error);
    },
  });
}