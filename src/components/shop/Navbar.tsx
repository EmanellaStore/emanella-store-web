"use client";
// src/components/shop/Navbar.tsx

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, User, Settings, LogOut } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUiStore } from "@/store/useUiStore";
import { useState, useEffect } from "react";
import { useSyncExternalStore } from "react";

function useCartItemCount() {
  return useSyncExternalStore(
    (callback) => useCartStore.subscribe(callback),
    () => useCartStore.getState().getItemCount(),
    () => 0
  );
}

const navLinks = [
  { name: "Inicio", path: "/" },
  { name: "Tienda", path: "/catalogo" },
  { name: "Ofertas", path: "/ofertas" },
  { name: "Sobre Nosotros", path: "/sobre-nosotros" },
  { name: "Contacto", path: "/contacto" },
];

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
          {/* Logo (el mismo del tema Shopify) */}
          <Link href="/" aria-label="Emanella Perfumería — Inicio" className="shrink-0">
            <Image
              src="/logo-emanella.png"
              alt="Emanella Perfumería"
              width={186}
              height={52}
              priority
              className="h-11 w-auto md:h-12"
            />
          </Link>

          {/* Menú Principal */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="font-sans text-[11px] font-medium tracking-[0.18em] text-cacao hover:text-gold-dark transition-all duration-300 uppercase relative group"
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

            <button
              type="button"
              onClick={() => useUiStore.getState().openCartDrawer()}
              aria-label="Abrir carrito"
              className="relative text-cacao hover:text-gold transition-colors"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-warm-black text-on-dark text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center font-sans shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-cacao"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <nav className="md:hidden border-t border-blush bg-cream px-6 py-6 flex flex-col gap-5">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              onClick={() => setMenuOpen(false)}
              className="font-sans text-[12px] font-medium tracking-[0.18em] text-cacao hover:text-gold-dark transition-colors uppercase"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}