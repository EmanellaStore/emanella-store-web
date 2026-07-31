//src/app/admin/inventory/page.tsx — Inventario por variante (estilo Shopify):
// búsqueda, filtro de stock bajo/agotado y edición rápida del stock en la tabla.
import db from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import StockCell from "@/components/admin/StockCell";

export const revalidate = 0;

const LOW_STOCK_THRESHOLD = 3;

type InventoryPageProps = {
  searchParams?: Promise<{ q?: string; filtro?: string }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim() : "";
  const filtro = params?.filtro === "bajo" || params?.filtro === "agotado" ? params.filtro : "";

  const variants = await db.productVariant.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { sku: { contains: q, mode: "insensitive" } },
              { product: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(filtro === "bajo" ? { stock: { lte: LOW_STOCK_THRESHOLD } } : {}),
      ...(filtro === "agotado" ? { stock: 0 } : {}),
    },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          isActive: true,
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
    orderBy: [{ stock: "asc" }, { product: { name: "asc" } }],
  });

  const totalUnits = variants.reduce((s, v) => s + v.stock, 0);
  const lowCount = variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD).length;
  const outCount = variants.filter((v) => v.stock === 0).length;

  const filters = [
    { key: "", label: "Todo" },
    { key: "bajo", label: `Stock bajo (≤${LOW_STOCK_THRESHOLD})` },
    { key: "agotado", label: "Agotados" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-cacao">Inventario</h1>
          <p className="font-sans text-sm text-warm-gray mt-1">
            {variants.length} variantes · {totalUnits.toLocaleString("es-CO")} unidades ·{" "}
            <span className="text-amber-600">{lowCount} con stock bajo</span> ·{" "}
            <span className="text-red-600">{outCount} agotadas</span>
          </p>
        </div>
        <form className="flex gap-2" action="/admin/inventory" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por producto o SKU…"
            className="w-64 border border-blush bg-bg-card px-3 py-2 font-sans text-sm text-cacao outline-none focus:border-gold"
          />
          {filtro ? <input type="hidden" name="filtro" value={filtro} /> : null}
          <button
            type="submit"
            className="bg-warm-black px-4 py-2 font-sans text-[11px] uppercase tracking-widest text-on-dark hover:bg-gold-dark transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/inventory${f.key ? `?filtro=${f.key}` : ""}${q ? `${f.key ? "&" : "?"}q=${encodeURIComponent(q)}` : ""}`}
            className={`px-3 py-1.5 border font-sans text-[11px] uppercase tracking-widest transition-colors ${
              filtro === f.key
                ? "bg-cacao text-on-dark border-cacao"
                : "border-blush text-cacao hover:border-gold"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-bg-card border border-blush overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead>
            <tr className="border-b border-blush">
              <th className="px-5 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Producto</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">Variante</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">SKU</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-right">Precio</th>
              <th className="px-3 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-center">Estado</th>
              <th className="px-5 py-3 font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blush/60">
            {variants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-sans text-sm text-warm-gray">
                  No hay variantes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              variants.map((v) => (
                <tr key={v.id} className="hover:bg-beige/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden border border-blush bg-beige">
                        {v.product.images[0]?.imageUrl ? (
                          <Image
                            src={v.product.images[0].imageUrl}
                            alt={v.product.name}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        ) : null}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-cacao truncate max-w-[260px]">
                          {v.product.name}
                          {!v.product.isActive && (
                            <span className="ml-2 font-sans text-[10px] uppercase text-warm-gray">(inactivo)</span>
                          )}
                        </p>
                        <Link
                          href={`/producto/${v.product.slug}`}
                          className="font-sans text-[11px] text-gold-dark hover:text-cacao"
                          target="_blank"
                        >
                          Ver en tienda →
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-sans text-sm text-cacao-light">{v.attributeValue}</td>
                  <td className="px-3 py-3 font-sans text-xs text-warm-gray">{v.sku}</td>
                  <td className="px-3 py-3 text-right font-serif text-sm font-semibold text-gold-dark">
                    ${Number(v.price).toLocaleString("es-CO")}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {v.stock === 0 ? (
                      <span className="inline-block bg-red-100 text-red-700 px-2 py-0.5 font-sans text-[10px] tracking-wider">AGOTADO</span>
                    ) : v.stock <= LOW_STOCK_THRESHOLD ? (
                      <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 font-sans text-[10px] tracking-wider">BAJO</span>
                    ) : (
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 font-sans text-[10px] tracking-wider">OK</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <StockCell variantId={v.id} stock={v.stock} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
