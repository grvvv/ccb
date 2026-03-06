// lib/cart-store.ts
// Local cart state that syncs to localStorage.
// TanStack Query is used to read/invalidate the cart like a server query.

export type CartItem = {
  _id: string;
  name: string;
  price: number;
  sellingPrice: number;
  productImages?: string[];
  quantity: number;
};

const CART_KEY = "cc_cart";

export const cartStore = {
  get(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  },

  set(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  add(product: Omit<CartItem, "quantity">, qty = 1) {
    const items = cartStore.get();
    const existing = items.find((i) => i._id === product._id);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({ ...product, quantity: qty });
    }
    cartStore.set(items);
  },

  remove(id: string) {
    cartStore.set(cartStore.get().filter((i) => i._id !== id));
  },

  updateQty(id: string, quantity: number) {
    if (quantity < 1) {
      cartStore.remove(id);
      return;
    }
    const items = cartStore.get();
    const item = items.find((i) => i._id === id);
    if (item) {
      item.quantity = quantity;
      cartStore.set(items);
    }
  },

  clear() {
    localStorage.removeItem(CART_KEY);
  },
};