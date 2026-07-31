//src/app/producto/[slug]/page.tsx
import db from "@/lib/db";
import { Navbar, Footer, AddToCartSection, ProductGallery } from "@/components/shop";
import PerfumePyramid from "@/components/shop/PerfumePyramid";
import PerfumeSpecs from "@/components/shop/PerfumeSpecs";
import WhatsAppCta from "@/components/shop/WhatsAppCta";
import ProductCarousel, { CarouselProduct } from "@/components/shop/ProductCarousel";
import RecentlyViewed from "@/components/shop/RecentlyViewed";
import { notFound } from "next/navigation";

type ProductPageProps = {
    params: Promise<{ slug: string }>;
};

// Campos del perfil olfativo: existen en el schema; hasta que corra la migración
// en Neon el cliente Prisma viejo no los trae y llegan undefined (los componentes
// no renderizan sin dato, así que es seguro en ambos estados).
type PerfumeFields = {
    notasSalida?: string | null;
    notasCorazon?: string | null;
    notasFondo?: string | null;
    concentracion?: string | null;
    familia?: string | null;
    duracion?: string | null;
    inspiradoEn?: string | null;
};

type ProductWithRelations = NonNullable<
    Awaited<
        ReturnType<
            typeof db.product.findUnique<{
                where: { slug: string };
                include: { variants: true; images: true };
            }>
        >
    >
>;

function toCarouselProduct(product: ProductWithRelations): CarouselProduct {
    const variant = product.variants[0];
    return {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.images[0]?.imageUrl || null,
        hoverImageUrl: product.images[1]?.imageUrl || null,
        category: product.category,
        price: variant ? Number(variant.price) : 0,
        originalPrice: variant?.originalPrice ? Number(variant.originalPrice) : null,
        variant: variant
            ? {
                  id: variant.id,
                  attributeName: variant.attributeName,
                  attributeValue: variant.attributeValue,
              }
            : null,
    };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
    const { slug } = await params;

    const product = await db.product.findUnique({
        where: { slug },
        include: {
            variants: { orderBy: { price: "asc" } },
            images: { orderBy: { position: "asc" } },
        },
    });

    if (!product || !product.isActive) {
        notFound();
    }

    const perfume = product as typeof product & PerfumeFields;

    // "También te pueden gustar": misma categoría, excluye el actual, sin repetidos.
    const related = await db.product.findMany({
        where: {
            isActive: true,
            category: product.category,
            id: { not: product.id },
        },
        include: {
            variants: { orderBy: { price: "asc" }, take: 1 },
            images: { orderBy: { position: "asc" }, take: 2 },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    const mainVariant = product.variants[0];
    const price = mainVariant ? Number(mainVariant.price) : 0;
    const originalPrice = mainVariant?.originalPrice
        ? Number(mainVariant.originalPrice)
        : null;
    const hasDiscount = Boolean(originalPrice && originalPrice > price);

    return (
        <main className="min-h-screen bg-cream">
            <Navbar />

            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    <ProductGallery
                        images={product.images}
                        productName={product.name}
                    />

                    <div className="flex flex-col">
                        <p className="eyebrow mb-4">{product.category}</p>

                        <h1 className="font-serif text-4xl md:text-5xl text-cacao font-medium mb-4 leading-tight">
                            {product.name}
                        </h1>

                        {/* Precio principal — Fraunces recta, champán hondo */}
                        <div className="mb-6 flex items-baseline gap-3">
                            {hasDiscount && (
                                <span className="font-sans text-base text-warm-gray line-through">
                                    ${originalPrice!.toLocaleString("es-CO")}
                                </span>
                            )}
                            <span className="font-serif text-2xl font-semibold text-gold-dark">
                                ${price.toLocaleString("es-CO")}
                            </span>
                            {hasDiscount && (
                                <span className="bg-warm-black px-2 py-0.5 font-sans text-[10px] tracking-[0.12em] text-on-dark">
                                    −{Math.round(((originalPrice! - price) / originalPrice!) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Ficha técnica en chips */}
                        <PerfumeSpecs
                            concentracion={perfume.concentracion}
                            familia={perfume.familia}
                            duracion={perfume.duracion}
                            inspiradoEn={perfume.inspiradoEn}
                        />

                        {product.description && (
                            <p className="mt-6 font-sans font-light text-cacao-light leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        <div className="mt-8">
                            <AddToCartSection
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    slug: product.slug,
                                    imageUrl: product.images[0]?.imageUrl || null,
                                    category: product.category,
                                }}
                                variants={product.variants.map((v) => ({
                                    id: v.id,
                                    sku: v.sku,
                                    attributeName: v.attributeName,
                                    attributeValue: v.attributeValue,
                                    price: Number(v.price),
                                    stock: v.stock,
                                }))}
                            />
                            <WhatsAppCta productName={product.name} />
                        </div>

                        {/* Pirámide olfativa — firma de marca */}
                        <PerfumePyramid
                            notasSalida={perfume.notasSalida}
                            notasCorazon={perfume.notasCorazon}
                            notasFondo={perfume.notasFondo}
                        />

                        {/* Acordeón: Envíos y entregas */}
                        <details className="group mt-8 border-t border-b border-blush py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between font-sans text-[11px] uppercase tracking-[0.2em] text-cacao">
                                Envíos y entregas
                                <span className="text-gold-dark transition-transform duration-200 group-open:rotate-45">
                                    +
                                </span>
                            </summary>
                            <div className="pt-4 font-sans text-sm font-light leading-relaxed text-cacao-light">
                                <p>
                                    Realizamos envíos a toda Colombia con guía de rastreo.
                                    Confirmamos cada pedido por WhatsApp antes de despacharlo y
                                    puedes pagar contra entrega en las principales ciudades.
                                </p>
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* Compromiso Emanella */}
            <section className="bg-beige py-16 border-y border-blush">
                <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center">
                    <p className="eyebrow mb-4">Nuestra promesa</p>
                    <h2 className="font-serif text-3xl md:text-4xl text-cacao font-medium mb-6">
                        Compromiso Emanella
                    </h2>
                    <p className="font-sans text-cacao-light font-light leading-relaxed">
                        Elegimos cada fragancia —original o alternativa 1.1— por su calidad,
                        su proyección y la historia que cuenta sobre tu piel. Sin humo, sin
                        poses: perfume que se siente caro porque es bueno.
                    </p>
                </div>
            </section>

            {/* Carruseles */}
            <ProductCarousel
                eyebrow="Recomendados"
                title="También te pueden gustar"
                products={related.map(toCarouselProduct)}
            />
            <RecentlyViewed current={toCarouselProduct(product)} />

            <Footer />
        </main>
    );
}
