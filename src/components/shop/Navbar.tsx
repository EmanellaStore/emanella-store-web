"use client";
import Link from "next/link";
import { ShoppingBag, Menu, X, User, Settings } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState, useSyncExternalStore } from "react";

function useCartItemCount() {
  return useSyncExternalStore(
    (callback) => {
      const unsubscribe = useCartStore.subscribe(callback);
      return unsubscribe;
    },
    () => useCartStore.getState().getItemCount(),
    () => 0
  );
}

function useIsAdmin() {
  const [session, setSession] = useState<string | null>(null);
  
  useState(() => {
    if (typeof window !== "undefined") {
      setSession(localStorage.getItem("admin_session"));
    }
  });
  
  return session === "true";
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartItemCount();
  const isAdmin = useIsAdmin();

  return (
    <header className="fixed top-0 w-full z-50 bg-cream/90 backdrop-blur-sm border-b border-blush/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-semibold text-cacao tracking-widest">Emanella</span>
            <span className="font-serif text-2xl font-light text-gold tracking-widest">Store</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Catálogo", "Perfumes", "Bolsos", "Accesorios"].map((item) => (
              <Link
                key={item}
                href={`/catalogo${item !== 'Catálogo' ? `?categoria=${item.toLowerCase()}` : ''}`}
                className="font-sans text-xs tracking-[0.2em] text-warm-gray hover:text-gold transition-colors uppercase"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAdmin ? (
              <Link href="/admin" className="p-2 text-cacao hover:text-gold transition-colors relative group" title="Panel Admin">
                <Settings size={20} strokeWidth={1.5} />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-gold">Admin</span>
              </Link>
            ) : (
              <Link href="/admin/login" className="p-2 text-cacao hover:text-gold transition-colors" title="Iniciar sesión">
                <User size={20} strokeWidth={1.5} />
              </Link>
            )}
            <Link href="/carrito" className="relative p-2 text-cacao hover:text-gold transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans animate-in fade-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 text-cacao" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}