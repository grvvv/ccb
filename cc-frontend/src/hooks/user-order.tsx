

import { orderService } from '@/services/order.service';
import type { OrderFormData } from '@/types/order';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, orderData }: { orderId: string; orderData: any }) =>
    orderService.update(orderId, orderData),
    onSuccess: (data) => {
      queryClient.setQueryData(['orders', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      orderService.deleteById(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
    },
  });
}

export function useMakeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: OrderFormData) => orderService.create(orderData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'names'] });
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    },
  });
}

export function useOrders(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['orders', 'list', params],
    queryFn: () => orderService.list(params),
  });
}
