"use client";

import { create } from "zustand";

// ─── Types ──────────────────────────────────────────

export interface CartItemClient {
  id: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
  productSlug: string;
}

interface CartStore {
  items: CartItemClient[];
  isOpen: boolean;
  isLoading: boolean;

  // Actions
  setItems: (items: CartItemClient[]) => void;
  addItem: (item: CartItemClient) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setLoading: (loading: boolean) => void;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
}

// ─── Store ──────────────────────────────────────────

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  setItems: (items) => set({ items }),

  addItem: (item) =>
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.variantId === item.variantId
      );

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + item.quantity,
        };
        return { items: updatedItems };
      }

      return { items: [...state.items, item] };
    }),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  clearItems: () => set({ items: [] }),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setLoading: (loading) => set({ isLoading: loading }),

  totalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
}));
