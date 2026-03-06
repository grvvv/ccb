
import { categoryService } from '@/services/category.service';
import type { CreateCategoryFormDetails } from '@/types/category';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCategoryDetails(categoryId: string) {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryService.getById(categoryId),
    enabled: !!categoryId,
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, productData }: { categoryId: string; productData: any }) =>
      categoryService.update(categoryId, productData),
    onSuccess: (data) => {
      queryClient.setQueryData(['categories', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['category', 'list'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoryService.deleteById(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category', 'list'] });
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateCategoryFormDetails) => categoryService.create(categoryData),
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: ['category', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['category', 'names'] });
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
    },
  });
}

export function useCategories(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['category', 'list', params],
    queryFn: () => categoryService.list(params),
  });
}
