"use client";
// src/components/admin/AdminSidebar.tsx

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, LogOut } from "lucide-react";

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
    <aside className="w-64 bg-cacao text-cream flex flex-col shrink-0">
      <div className="p-6 border-b border-cream/10">
        <Link href="/" className="block">
          <span className="font-serif text-2xl font-semibold tracking-widest">
            Emanella
          </span>
          <span className="block font-sans text-[10px] tracking-widest text-cream/60 uppercase mt-1">
            Panel Administrativo
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm rounded transition-colors ${
                    isActive
                      ? "bg-gold text-cacao"
                      : "text-cream/80 hover:bg-cream/10 hover:text-cream"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-sans tracking-widest uppercase text-[10px]">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-cream/10 space-y-2">
        <Link
          href="/catalogo"
          className="flex items-center gap-3 px-4 py-3 text-sm text-cream/60 hover:text-cream transition-colors"
        >
          <LogOut size={18} />
          <span className="font-sans tracking-widest uppercase text-[10px]">
            Ver Tienda
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