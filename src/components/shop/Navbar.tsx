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
    <header className="fixed top-0 w-full z-50 bg-cream/80 backdrop-blur-md border-b border-blush/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col group">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-3xl font-medium text-cacao tracking-wider leading-none">
                Emanella <span className="text-gold">Store</span>
              </span>
            </div>
            <span className="font-sans text-[9px] uppercase text-warm-gray tracking-[0.3em] mt-1 ml-0.5 transition-colors group-hover:text-gold">
              Perfumería & Accesorios
            </span>
          </Link>

          {/* Menú Principal */}
          <nav className="hidden md:flex items-center gap-10">
            {[
              { name: "Inicio", path: "/" },
              { name: "Tienda", path: "/catalogo" },
              { name: "Ofertas", path: "/catalogo?ofertas=true" },
              { name: "Sobre Nosotros", path: "/sobre-nosotros" },
              { name: "Contacto", path: "/contacto" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="font-sans text-[11px] font-medium tracking-[0.15em] text-cacao hover:text-gold transition-all duration-300 uppercase relative group"
              >
                {item.name}
                <span className="absolute -bottom-1.5 left-1/2 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-1/2 group-hover:-translate-x-1/2"></span>
                <span className="absolute -bottom-1.5 right-1/2 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-1/2 group-hover:translate-x-1/2"></span>
              </Link>
            ))}
          </nav>

          {/* Iconos */}
          <div className="flex items-center gap-5">
            {!authState.ready ? (
              <div className="w-10" />
            ) : authState.isAdmin ? (
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-cacao hover:text-gold transition-colors" title="Panel Admin">
                  <Settings size={18} strokeWidth={1.5} />
                </Link>
                <button onClick={handleLogout} className="text-cacao hover:text-red-400 transition-colors" title="Cerrar sesión">
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : authState.user ? (
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-warm-gray font-sans uppercase tracking-widest hidden md:block">
                  Hola, <span className="text-cacao font-medium">{authState.user.name}</span>
                </span>
                <button onClick={handleLogout} className="text-cacao hover:text-red-400 transition-colors" title="Cerrar sesión">
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-cacao hover:text-gold transition-colors" title="Iniciar sesión">
                <User size={18} strokeWidth={1.5} />
              </Link>
            )}

            <Link href="/carrito" className="relative text-cacao hover:text-gold transition-colors">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-blush-dark text-warm-black text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center font-sans shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            <button className="md:hidden text-cacao" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}