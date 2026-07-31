import Navbar from "@/components/shop/Navbar";
import Footer from "@/components/shop/Footer";
import ProductCard from "@/components/shop/ProductCard";
import db from "@/lib/db";
import Link from "next/link";
import { Gift, Sparkles, Tag } from "lucide-react";

export const revalidate = 0; // Desactivar caché para refrescar ofertas en tiempo real

export default async function OfertasPage() {
  // Obtener productos en oferta o de la categoría combos
  const products = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { category: "combos" },
        {
          variants: {
            some: {
              originalPrice: {
                not: null,
              },
            },
          },
        },
      ],
    },
    include: {
      variants: {
        orderBy: {
          price: "asc",
        },
      },
      images: {
        orderBy: {
          position: "asc",
        },
        take: 2,
      },
    },
  });

  // Filtrar combos especiales
  const combos = products
    .filter((p) => p.category === "combos")
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images[0]?.imageUrl || null,
      hoverImageUrl: product.images[1]?.imageUrl || null,
      category: product.category,
      minPrice: product.variants.length > 0 ? Number(product.variants[0].price) : 0,
      originalPrice: product.variants.length > 0 && product.variants[0].originalPrice
        ? Number(product.variants[0].originalPrice)
        : null,
      variant: product.variants[0]
        ? {
            id: product.variants[0].id,
            attributeName: product.variants[0].attributeName,
            attributeValue: product.variants[0].attributeValue,
          }
        : null,
    }));

  // Filtrar fragancias y artículos individuales en oferta
  const discounts = products
    .filter((p) => p.category !== "combos")
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images[0]?.imageUrl || null,
      hoverImageUrl: product.images[1]?.imageUrl || null,
      category: product.category,
      minPrice: product.variants.length > 0 ? Number(product.variants[0].price) : 0,
      originalPrice: product.variants.length > 0 && product.variants[0].originalPrice
        ? Number(product.variants[0].originalPrice)
        : null,
      variant: product.variants[0]
        ? {
            id: product.variants[0].id,
            attributeName: product.variants[0].attributeName,
            attributeValue: product.variants[0].attributeValue,
          }
        : null,
    }))
    .filter((p) => p.originalPrice !== null && p.originalPrice > p.minPrice);

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />

      {/* Header Premium de Ofertas */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-1.5 rounded-full border border-gold/20 mb-6 animate-fade-in">
          <Sparkles size={14} className="animate-pulse" />
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold">
            Precios Especiales de Boutique
          </span>
        </div>
        <h1 className="font-serif text-5xl md:text-7xl text-cacao font-light leading-tight">
          Kits Exclusivos <br />& <span className="font-serif italic text-gold">Ofertas Especiales</span>
        </h1>
        <p className="font-sans text-warm-gray mt-6 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Descubre nuestros combos de perfumes + aerosoles y descuentos seleccionados para consentirte con lo mejor del lujo olfativo a precios inigualables.
        </p>
      </section>

      {/* Sección 1: COMBOS Y KITS DE REGALO */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-cacao/5">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <Gift size={20} />
          </div>
          <div>
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold font-medium block">
              Lleva Más, Paga Menos
            </span>
            <h2 className="font-serif text-3xl text-cacao">
              Combos & Kits Especiales
            </h2>
          </div>
        </div>

        {combos.length === 0 ? (
          <div className="bg-white/40 border border-blush/20 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm">
            <Gift size={40} className="mx-auto mb-4 text-warm-gray/60" />
            <h3 className="font-serif text-xl text-cacao mb-2">Próximamente más combos</h3>
            <p className="font-sans text-xs text-warm-gray leading-relaxed mb-6">
              Estamos preparando combinaciones increíbles de tus perfumes favoritos con aerosoles, cremas y lociones para darte el mejor ahorro.
            </p>
            <Link
              href="/catalogo"
              className="inline-block bg-cacao text-cream px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-gold transition-colors"
            >
              Explorar el Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {combos.map((combo) => (
              <ProductCard
                key={combo.id}
                name={combo.name}
                slug={combo.slug}
                imageUrl={combo.imageUrl}
                hoverImageUrl={combo.hoverImageUrl}
                category="Combo especial"
                price={combo.minPrice}
                originalPrice={combo.originalPrice}
                productId={combo.id}
                variant={combo.variant}
              />
            ))}
          </div>
        )}
      </section>

      {/* Sección 2: ARTÍCULOS CON DESCUENTO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-cacao/5">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <Tag size={20} />
          </div>
          <div>
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold font-medium block">
              Tiempo Limitado
            </span>
            <h2 className="font-serif text-3xl text-cacao">
              Fragancias con Descuento
            </h2>
          </div>
        </div>

        {discounts.length === 0 ? (
          <div className="bg-white/40 border border-blush/20 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm">
            <Tag size={40} className="mx-auto mb-4 text-warm-gray/60" />
            <h3 className="font-serif text-xl text-cacao mb-2">No hay ofertas individuales activas</h3>
            <p className="font-sans text-xs text-warm-gray leading-relaxed mb-6">
              Todos nuestros productos se encuentran actualmente a su precio habitual de boutique. ¡Regresa pronto para no perderte nuestras rebajas de temporada!
            </p>
            <Link
              href="/catalogo"
              className="inline-block bg-cacao text-cream px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-gold transition-colors"
            >
              Ver Colección Completa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {discounts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                imageUrl={product.imageUrl}
                hoverImageUrl={product.hoverImageUrl}
                category={product.category}
                price={product.minPrice}
                originalPrice={product.originalPrice}
                productId={product.id}
                variant={product.variant}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
