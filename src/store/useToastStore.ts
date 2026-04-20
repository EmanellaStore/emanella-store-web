import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string; 
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = crypto.randomUUID();
    const duration = toast.duration ?? 5000;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id, duration }] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));