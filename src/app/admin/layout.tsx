// src/app/admin/layout.tsx
// Este layout NO hace ninguna verificación de auth en el cliente.
// La protección viene de dos lugares:
//   1. src/middleware.ts verifica la cookie ANTES de que llegue aquí
//   2. Si el middleware falla, el usuario simplemente ve el panel (riesgo bajo en dev)
// En producción el middleware es suficiente.

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}