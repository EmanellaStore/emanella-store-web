import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  attributeName: string;
  attributeValue: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface CartState {
  items: CartItem[];
  sessionId: string;
  phone: string | null;
  customerId: string | null;
  setContact: (data: { phone?: string; customerId?: string }) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  couponCode: string | null;
  discount: number;
  setCoupon: (code: string, discountAmount: number) => void;
  clearCoupon: () => void;
}

// Generador simple de UUID v4 sin dependencias
const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: uuid(),
      phone: null,
      customerId: null,
      couponCode: null,
      discount: 0,

      setContact: ({ phone, customerId }) => {
        set({
          phone: phone ?? get().phone,
          customerId: customerId ?? get().customerId,
        });
      },

      addItem: (newItem) => {
        const currentItems = get().items;
        const existing = currentItems.find(i => i.variantId === newItem.variantId);
        if (existing) {
          set({
            items: currentItems.map(i =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (variantId) =>
        set({ items: get().items.filter(i => i.variantId !== variantId) }),

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        set({
          items: get().items.map(i =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
          // Reseteamos el cupón si cambian las cantidades, por si ya no cumple el mínimo
          couponCode: null,
          discount: 0,
        });
      },

      clearCart: () => set({ items: [], couponCode: null, discount: 0 }),

      getTotal: () => {
        const subtotal = get().items.reduce((t, i) => t + i.price * i.quantity, 0);
        return Math.max(0, subtotal - get().discount);
      },
      getItemCount: () => get().items.reduce((c, i) => c + i.quantity, 0),

      setCoupon: (code, discountAmount) => set({ couponCode: code, discount: discountAmount }),
      clearCoupon: () => set({ couponCode: null, discount: 0 }),
    }),
    { name: 'emanella-cart-storage' }
  )
);