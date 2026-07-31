//src/app/admin/customers/page.tsx — Clientes (estilo Shopify):
// búsqueda por nombre/teléfono, gasto total, pedidos y última compra.
import db from "@/lib/db";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const revalidate = 0;

type CustomersPageProps = {
  searchParams?: Promise<{ q?: string; orden?: string }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim() : "";
  const orden = params?.orden === "gasto" ? "gasto" : "recientes";

  const customers = await db.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { city: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy:
      orden === "gasto" ? { totalSpent: "desc" } : { createdAt: "desc" },
    take: 200,
  });

  const totals = await db.customer.aggregate({
    _count: true,
    _sum: { totalSpent: true },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-cacao">Clientes</h1>
          <p className="font-sans text-sm text-warm-gray mt-1">
            {totals._count.toLocaleString("es-CO")} clientes · $
            {Number(totals._sum.totalSpent ?? 0).toLocaleString("es-CO")} en compras históricas
          </p>
        </div>
        <form className="flex gap-2" action="/admin/customers" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Nombre, teléfono o ciudad…"
            className="w-64 border border-blush bg-bg-card px-3 py-2 font-sans text-sm text-cacao outline-none focus:border-gold"
          />
          {orden !== "recientes" ? <input type="hidden" name="orden" value={orden} /> : null}
          <button
            type="submit"
            className="bg-warm-black px-4 py-2 font-sans text-[11px] uppercase tracking-widest text-on-dark hover:bg-gold-dark transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="flex gap-2">
        {[
          { key: "recientes", label: "Recientes" },
          { key: "gasto", label: "Mayor gasto" },
        ].map((f) => (
          <Link
            key={f.key}
            href={`/admin/customers?orden=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`px-3 py-1.5 border font-sans text-[11px] uppercase tracking-widest transition-colors ${
              orden === f.key
                ? "bg-cacao text-on-dark border-cacao"
                : "border-blush text-cacao hover:border-gold"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-bg-card border border-blush overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead>
            <tr className="border-b border-blush">
              <th className="px-5 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Cliente</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Ciudad</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-center">Pedidos</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-right">Total gastado</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Última compra</th>
              <th className="px-5 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-right">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush/60">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-sans text-sm text-warm-gray">
                  No hay clientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-beige/60">
                  <td className="px-5 py-3">
                    <p className="font-sans text-sm text-cacao">{c.name}</p>
                    <p className="font-sans text-[11px] text-warm-gray">{c.phone}</p>
                  </td>
                  <td className="px-3 py-3 font-sans text-sm text-cacao-light">{c.city ?? "—"}</td>
                  <td className="px-3 py-3 text-center font-sans text-sm text-cacao">{c.orderCount}</td>
                  <td className="px-3 py-3 text-right font-serif text-sm font-semibold text-gold-dark">
                    ${Number(c.totalSpent).toLocaleString("es-CO")}
                  </td>
                  <td className="px-3 py-3 font-sans text-xs text-warm-gray">
                    {c.lastPurchaseAt
                      ? new Date(c.lastPurchaseAt).toLocaleDateString("es-CO", { dateStyle: "medium" })
                      : "Sin compras"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a
                      href={`https://wa.me/57${c.phone.replace(/\D/g, "").replace(/^57/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest text-green-700 hover:text-green-800"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {customers.length === 200 && (
        <p className="font-sans text-xs text-warm-gray">
          Mostrando los primeros 200 resultados; usa la búsqueda para afinar.
        </p>
      )}
    </div>
  );
}
