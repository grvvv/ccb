
import { productService } from '@/services/product.service';
import type { CreateProductFormDetails } from '@/types/product';
// import type { CreateProductDetails } from '@/types/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useProductDetails(productId: string) {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: () => productService.getById(productId),
    enabled: !!productId,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productData }: { productId: string; productData: any }) =>
      productService.update(productId, productData),
    onSuccess: (data) => {
      queryClient.setQueryData(['products', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      productService.deleteById(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: CreateProductFormDetails) => productService.create(productData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'names'] });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}

export function useProducts(params?: { page?: number; limit?: number; search?: string, category?: string }) {
  return useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () => productService.list(params),
  });
}
