"use client";
// src/components/admin/AdminSidebar.tsx

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, LogOut, Home } from "lucide-react";

const navItems = [
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/products", label: "Productos", icon: Package },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.replace("/login");
    }
  };

  return (
    <aside className="w-64 bg-warm-black text-cacao flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Link href="/admin" className="font-serif text-xl tracking-widest text-cacao flex flex-col">
          Emanella <span className="text-gold">Store</span>
          <span className="block font-sans text-[10px] tracking-widest text-cacao-light uppercase mt-1">
            Panel de Control
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3 font-sans text-sm tracking-wider transition-colors relative ${
                    isActive
                      ? "text-gold bg-white/5"
                      : "text-cacao-light hover:bg-white/5 hover:text-cacao"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-cacao-light hover:text-cacao transition-colors"
        >
          <Home size={18} strokeWidth={1.5} />
          <span className="font-sans tracking-widest uppercase text-[10px]">
            Volver a la tienda
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={18} />
          <span className="font-sans tracking-widest uppercase text-[10px]">
            Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
}