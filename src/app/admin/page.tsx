//src/app/admin/page.tsx — Inicio del panel (métricas estilo Shopify)
import db from "@/lib/db";
import Link from "next/link";
import {
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";

export const revalidate = 0;

const LOW_STOCK_THRESHOLD = 3;

function money(n: number) {
  return `$${n.toLocaleString("es-CO")}`;
}

const STATUS_STYLES: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-violet-100 text-violet-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-700",
};

export default async function AdminDashboardPage() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start7 = new Date(startToday);
  start7.setDate(start7.getDate() - 6);
  const start30 = new Date(startToday);
  start30.setDate(start30.getDate() - 29);

  const paidStatuses = ["CONFIRMADO", "ENVIADO", "ENTREGADO"] as const;

  const [
    salesToday,
    sales7,
    sales30,
    pendingCount,
    lowStock,
    recentOrders,
    topSold,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { status: { in: [...paidStatuses] }, createdAt: { gte: startToday } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { status: { in: [...paidStatuses] }, createdAt: { gte: start7 } },
    }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { status: { in: [...paidStatuses] }, createdAt: { gte: start30 } },
    }),
    db.order.count({ where: { status: "PENDIENTE" } }),
    db.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    db.order.findMany({
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.orderItem.groupBy({
      by: ["variantId"],
      _sum: { quantity: true },
      where: { order: { createdAt: { gte: start30 }, status: { in: [...paidStatuses] } } },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const topVariants = topSold.length
    ? await db.productVariant.findMany({
        where: { id: { in: topSold.map((t) => t.variantId) } },
        include: { product: { select: { name: true } } },
      })
    : [];
  const topProducts = topSold.map((t) => ({
    qty: t._sum.quantity ?? 0,
    variant: topVariants.find((v) => v.id === t.variantId),
  }));

  const lowStockTotal = await db.productVariant.count({
    where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
  });

  const cards = [
    {
      label: "Ventas de hoy",
      value: money(Number(salesToday._sum.totalAmount ?? 0)),
      sub: `${salesToday._count} pedidos`,
      icon: TrendingUp,
    },
    {
      label: "Últimos 7 días",
      value: money(Number(sales7._sum.totalAmount ?? 0)),
      sub: `${sales7._count} pedidos`,
      icon: TrendingUp,
    },
    {
      label: "Últimos 30 días",
      value: money(Number(sales30._sum.totalAmount ?? 0)),
      sub: `${sales30._count} pedidos`,
      icon: TrendingUp,
    },
    {
      label: "Pendientes por confirmar",
      value: String(pendingCount),
      sub: "pedidos en PENDIENTE",
      icon: Clock,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-cacao">Inicio</h1>
        <p className="font-sans text-sm text-warm-gray mt-1">
          Resumen de la operación (solo pedidos confirmados, enviados o entregados suman ventas).
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, href }) => {
          const inner = (
            <div className="bg-bg-card border border-blush p-5 h-full transition-colors hover:border-gold">
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
                  {label}
                </span>
                <Icon size={16} className="text-gold-dark" />
              </div>
              <p className="font-serif text-2xl font-semibold text-cacao">{value}</p>
              <p className="font-sans text-xs text-warm-gray mt-1">{sub}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>{inner}</Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <section className="xl:col-span-2 bg-bg-card border border-blush">
          <div className="flex items-center justify-between px-5 py-4 border-b border-blush">
            <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-cacao flex items-center gap-2">
              <ShoppingCart size={14} className="text-gold-dark" /> Pedidos recientes
            </h2>
            <Link href="/admin/orders" className="font-sans text-[11px] uppercase tracking-widest text-gold-dark hover:text-cacao">
              Ver todos →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-5 font-sans text-sm text-warm-gray">Aún no hay pedidos.</p>
          ) : (
            <table className="w-full text-left">
              <tbody className="divide-y divide-blush/60">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-beige/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-sans text-sm text-cacao hover:text-gold-dark">
                        {o.customer?.name ?? "Cliente"}
                      </Link>
                      <p className="font-sans text-[11px] text-warm-gray">
                        {new Date(o.createdAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-wider rounded-sm ${STATUS_STYLES[o.status] ?? ""}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-serif text-sm font-semibold text-gold-dark">
                      {money(Number(o.totalAmount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Stock bajo */}
        <section className="bg-bg-card border border-blush">
          <div className="flex items-center justify-between px-5 py-4 border-b border-blush">
            <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-cacao flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600" /> Stock bajo (≤{LOW_STOCK_THRESHOLD})
            </h2>
            <Link href="/admin/inventory?filtro=bajo" className="font-sans text-[11px] uppercase tracking-widest text-gold-dark hover:text-cacao">
              {lowStockTotal} en total →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="p-5 font-sans text-sm text-warm-gray">Todo el inventario está sano. ✨</p>
          ) : (
            <ul className="divide-y divide-blush/60">
              {lowStock.map((v) => (
                <li key={v.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-sans text-sm text-cacao truncate">{v.product.name}</p>
                    <p className="font-sans text-[11px] text-warm-gray">{v.attributeValue} · {v.sku}</p>
                  </div>
                  <span className={`shrink-0 font-serif text-sm font-semibold ${v.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {v.stock === 0 ? "Agotado" : `${v.stock} und`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Más vendidos 30 días */}
      <section className="bg-bg-card border border-blush">
        <div className="px-5 py-4 border-b border-blush">
          <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-cacao">
            Más vendidos (últimos 30 días)
          </h2>
        </div>
        {topProducts.length === 0 ? (
          <p className="p-5 font-sans text-sm text-warm-gray">Sin ventas registradas en el período.</p>
        ) : (
          <ul className="divide-y divide-blush/60">
            {topProducts.map(({ qty, variant }, i) => (
              <li key={variant?.id ?? i} className="px-5 py-3 flex items-center gap-4">
                <span className="font-serif italic text-lg text-gold-dark w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-cacao truncate">
                    {variant?.product.name ?? "Producto eliminado"}
                  </p>
                  <p className="font-sans text-[11px] text-warm-gray">{variant?.attributeValue}</p>
                </div>
                <span className="font-sans text-sm text-cacao">{qty} und</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
