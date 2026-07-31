"use client";
// src/components/admin/AdminSidebar.tsx

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingCart,
  LogOut,
  Home,
  LayoutDashboard,
  Boxes,
  Users,
  TicketPercent,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/inventory", label: "Inventario", icon: Boxes },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/coupons", label: "Cupones", icon: TicketPercent },
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
    <aside className="w-64 bg-warm-black text-on-dark flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-on-dark/10">
        <Link href="/admin" className="flex flex-col gap-1">
          <Image
            src="/logo-emanella-white.png"
            alt="Emanella Perfumería"
            width={140}
            height={40}
            className="h-9 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3 font-sans text-sm tracking-wider transition-colors relative ${
                    isActive
                      ? "text-gold bg-on-dark/5"
                      : "text-on-dark/60 hover:bg-on-dark/5 hover:text-on-dark"
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

      <div className="p-4 border-t border-on-dark/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-on-dark/60 hover:text-on-dark transition-colors"
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
