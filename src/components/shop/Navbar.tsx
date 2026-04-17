//src/components/shop/Navbar.tsx
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Link from "next/link";
import { ShoppingBag, Menu, X, User, Settings, LogOut } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useSyncExternalStore } from "react";

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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartItemCount();
  
  // Initialize state from localStorage - this is intentional for client-only auth
  const [authState, setAuthState] = useState<{
    admin: boolean;
    user: { name: string; role: string } | null;
    ready: boolean;
  }>({
    admin: false,
    user: null,
    ready: false,
  });

  // Only run on client after mount
  useEffect(() => {
    const admin = localStorage.getItem("admin_session") === "true";
    let user: { name: string; role: string } | null = null;
    
    if (!admin) {
      const userSession = localStorage.getItem("user_session");
      if (userSession) {
        try {
          user = JSON.parse(userSession);
        } catch {
          user = null;
        }
      }
    }

    setAuthState({ admin, user, ready: true });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    window.location.href = "/catalogo";
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_session");
    window.location.href = "/catalogo";
  };

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
            {!authState.ready ? (
              <div className="w-10" />
            ) : authState.admin ? (
              <div className="flex items-center gap-3">
                <Link href="/admin" className="p-2 text-cacao hover:text-gold transition-colors relative group" title="Panel Admin">
                  <Settings size={20} strokeWidth={1.5} />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-gold">Admin</span>
                </Link>
                <button onClick={handleAdminLogout} className="p-2 text-cacao hover:text-red-500" title="Cerrar sesión">
                  <LogOut size={20} strokeWidth={1.5} />
                </button>
              </div>
            ) : authState.user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-cacao font-sans hidden md:block">
                  Hola, <span className="text-gold font-bold">{authState.user.name}</span>
                </span>
                <button onClick={handleLogout} className="p-2 text-cacao hover:text-red-500" title="Cerrar sesión">
                  <LogOut size={20} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="p-2 text-cacao hover:text-gold transition-colors" title="Iniciar sesión">
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