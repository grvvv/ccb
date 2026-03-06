// hooks/use-cart.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartStore, type CartItem } from "@/lib/cart-store";
import { toast } from "sonner";

export const CART_QUERY_KEY = ["cart"];

// ─── Read ────────────────────────────────────────────────────────────────────

export function useCart() {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartStore.get(),
    // Cart lives in localStorage — always fresh, no stale time needed.
    staleTime: Infinity,
  });
}

export function useCartCount() {
  const { data: items = [] } = useCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function useCartTotal() {
  const { data: items = [] } = useCart();
  return items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useAddToCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product,
      qty = 1,
    }: {
      product: Omit<CartItem, "quantity">;
      qty?: number;
    }) => {
      cartStore.add(product, qty);
      return cartStore.get();
    },
    onSuccess: (items) => {
      qc.setQueryData(CART_QUERY_KEY, items);
      toast.success("Added to cart");
    },
    onError: () => {
      toast.error("Failed to add item");
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      cartStore.remove(id);
      return cartStore.get();
    },
    onSuccess: (items) => {
      qc.setQueryData(CART_QUERY_KEY, items);
      toast.success("Item removed");
    },
  });
}

export function useUpdateCartQty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      cartStore.updateQty(id, quantity);
      return cartStore.get();
    },
    onSuccess: (items) => {
      qc.setQueryData(CART_QUERY_KEY, items);
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      cartStore.clear();
      return [] as CartItem[];
    },
    onSuccess: (items) => {
      qc.setQueryData(CART_QUERY_KEY, items);
      toast.success("Cart cleared");
    },
  });
}