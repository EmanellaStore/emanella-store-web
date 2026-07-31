//src/app/admin/coupons/page.tsx — Cupones (estilo "Descuentos" de Shopify):
// lista con estado real (activo/agotado/vencido), usos y creación manual.
import db from "@/lib/db";
import { CreateCouponForm, CouponToggle } from "@/components/admin/CouponAdmin";

export const revalidate = 0;

function couponState(c: {
  active: boolean;
  expiresAt: Date | null;
  maxUses: number | null;
  usedCount: number;
}) {
  if (!c.active) return { label: "INACTIVO", cls: "bg-gray-200 text-gray-600" };
  if (c.expiresAt && c.expiresAt < new Date())
    return { label: "VENCIDO", cls: "bg-red-100 text-red-700" };
  if (c.maxUses !== null && c.usedCount >= c.maxUses)
    return { label: "AGOTADO", cls: "bg-amber-100 text-amber-800" };
  return { label: "ACTIVO", cls: "bg-green-100 text-green-800" };
}

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const activeCount = coupons.filter((c) => couponState(c).label === "ACTIVO").length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-cacao">Cupones</h1>
          <p className="font-sans text-sm text-warm-gray mt-1">
            {coupons.length} cupones · {activeCount} activos. Los de campaña
            (BIENVENIDA, FOTO, VOLVISTE…) los genera n8n automáticamente.
          </p>
        </div>
        <CreateCouponForm />
      </div>

      <div className="bg-bg-card border border-blush overflow-x-auto">
        <table className="w-full text-left min-w-[820px]">
          <thead>
            <tr className="border-b border-blush">
              <th className="px-5 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Código</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Descuento</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Campaña</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-center">Usos</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Vence</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-center">Estado</th>
              <th className="px-5 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush/60">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center font-sans text-sm text-warm-gray">
                  Aún no hay cupones. Crea el primero con "+ Crear cupón".
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const st = couponState(c);
                return (
                  <tr key={c.id} className="hover:bg-beige/60">
                    <td className="px-5 py-3">
                      <p className="font-sans text-sm font-medium text-cacao tracking-wider">{c.code}</p>
                      {c.customer && (
                        <p className="font-sans text-[11px] text-warm-gray">Para: {c.customer.name}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 font-serif text-sm font-semibold text-gold-dark">
                      {c.type === "PERCENT"
                        ? `${Number(c.value)}%`
                        : `$${Number(c.value).toLocaleString("es-CO")}`}
                      {c.minAmount && (
                        <span className="block font-sans text-[11px] font-normal text-warm-gray">
                          mín. ${Number(c.minAmount).toLocaleString("es-CO")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-sans text-xs text-cacao-light">{c.campaign ?? "—"}</td>
                    <td className="px-3 py-3 text-center font-sans text-sm text-cacao">
                      {c.usedCount}
                      {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                    </td>
                    <td className="px-3 py-3 font-sans text-xs text-warm-gray">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("es-CO", { dateStyle: "medium" })
                        : "No vence"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 font-sans text-[10px] tracking-wider ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <CouponToggle id={c.id} active={c.active} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
