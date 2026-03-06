
import { carouselService } from '@/services/carousel.service';
import type { CarouselForm } from '@/types/carousel';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCarouselDetails(id: string) {
  return useQuery({
    queryKey: ['carousel', id],
    queryFn: () => carouselService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      carouselService.update(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['categories', data._id], data);
      queryClient.invalidateQueries({ queryKey: ['category', 'list'] });
    },
  });
}

export function useDeleteCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      carouselService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category', 'list'] });
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
    },
  });
}

export function useCreateCarousel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CarouselForm) => carouselService.create(data),
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

export function useCarousels() {
  return useQuery({
    queryKey: ['carousel'],
    queryFn: () => carouselService.list(),
  });
}
