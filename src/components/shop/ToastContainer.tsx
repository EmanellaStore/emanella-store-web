"use client";

import { useToastStore } from "@/store/useToastStore";
import { Check, X } from "lucide-react";
import Image from "next/image";

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-24 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto min-w-[340px] max-w-md bg-cream border-2 border-gold/60
            shadow-2xl flex items-start gap-4 px-6 py-5
            animate-[slideInRight_0.3s_ease-out]"
        >
          {/* Imagen del producto (si existe) */}
          {toast.imageUrl && (
            <div className="flex-shrink-0 w-16 h-16 relative bg-white/50 border border-blush/30 overflow-hidden">
              <Image
                src={toast.imageUrl}
                alt={toast.description || "Producto"}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}

          {/* Ícono check (solo si NO hay imagen) */}
          {!toast.imageUrl && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warm-black flex items-center justify-center">
              <Check size={20} className="text-on-dark" strokeWidth={2.5} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-serif text-base text-cacao leading-tight font-medium">
              {toast.title}
            </p>
            {toast.description && (
              <p className="font-sans text-sm text-warm-gray mt-1.5 line-clamp-2">
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-warm-gray hover:text-cacao transition-colors mt-0.5"
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      ))}
    </div>
  );
}