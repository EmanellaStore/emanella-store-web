"use client";
// src/components/shop/Navbar.tsx

import Link from "next/link";
import { ShoppingBag, Menu, X, User, Settings, LogOut } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { useSyncExternalStore } from "react";

function useCartItemCount() {
  return useSyncExternalStore(
    (callback) => useCartStore.subscribe(callback),
    () => useCartStore.getState().getItemCount(),
    () => 0
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartItemCount();
  const [authState, setAuthState] = useState<{
    isAdmin: boolean;
    user: { name: string } | null;
    ready: boolean;
  }>({ isAdmin: false, user: null, ready: false });
  
  useEffect(() => {  
    const load = async () => {  
      try {  
        const res = await fetch("/api/auth/me", { cache: "no-store" });  
        const data = await res.json();  
        setAuthState({  
          isAdmin: data.user?.role === "ADMIN",  
          user: data.user,  
          ready: true,  
        });  
      } catch {  
        setAuthState({ isAdmin: false, user: null, ready: true });  
      }  
    };  
    load();  
    window.addEventListener("userSessionChange", load);  
    return () => window.removeEventListener("userSessionChange", load);  
  }, []);

  const handleLogout = async () => {  
    try {  
      await fetch("/api/auth/logout", { method: "POST" });  
    } catch {  
      /* ignore */  
    }  
    localStorage.removeItem("user_session");  
    sessionStorage.removeItem("is_admin");  
    window.location.replace("/catalogo");  
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-cream/90 backdrop-blur-sm border-b border-blush/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex flex-col group">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-semibold text-cacao tracking-widest leading-tight">
                Emanella
              </span>
              <span className="font-serif text-2xl font-light text-gold tracking-widest leading-tight">
                Store
              </span>
            </div>
            <span className="font-serif text-[10px] italic text-cacao/60 tracking-[0.2em] -mt-1 ml-0.5 transition-colors group-hover:text-gold/80">
              By Maria Alejandra Pinzon
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Catálogo", "Perfumes", "Bolsos", "Accesorios"].map((item) => (
              <Link
                key={item}
                href={`/catalogo${item !== "Catálogo" ? `?categoria=${item.toLowerCase()}` : ""}`}
                className="font-sans text-xs tracking-[0.2em] text-warm-gray hover:text-gold transition-colors uppercase"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {!authState.ready ? (
              <div className="w-10" />
            ) : authState.isAdmin ? (
              <div className="flex items-center gap-3">
                <Link href="/admin" className="p-2 text-cacao hover:text-gold transition-colors relative" title="Panel Admin">
                  <Settings size={20} strokeWidth={1.5} />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-gold">
                    Admin
                  </span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-cacao hover:text-red-500" title="Cerrar sesión">
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
                <span className="absolute top-1 right-1 bg-gold text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
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