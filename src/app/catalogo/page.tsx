import { Navbar, ProductCard, Footer } from "@/components/shop";
import db from "@/lib/db";
import Link from "next/link";
import CatalogSearchTracker from "./CatalogSearchTracker";

type CatalogPageProps = {
    searchParams?: Promise<{
        categoria?: string;
        q?: string;
        genero?: string;
        orden?: string;
    }>;
};

// Por ahora la tienda es solo perfumería; bolsos/accesorios/zapatos se
// reactivarán más adelante (decisión de Steven 2026-07-09).
const validCategories = [
    "perfumes",
    // "bolsos",
    // "accesorios",
    // "zapatos",
];
const validGeneros = ["hombre", "dama", "unisex"];

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const params = await searchParams;
    const categoria = typeof params?.categoria === "string" ? params.categoria.toLowerCase() : "";
    const q = typeof params?.q === "string" ? params.q.trim() : "";
    const genero = validGeneros.includes(params?.genero?.toLowerCase() ?? "")
        ? params!.genero!.toLowerCase()
        : "";
    const orden = params?.orden === "recientes" ? "recientes" : "";

    const categoryFilter = validCategories.includes(categoria)
        ? { category: categoria }
        : {};

    const searchFilter = q
        ? {
            OR: [
                {
                    name: {
                        contains: q,
                        mode: "insensitive" as const,
                    },
                },
                {
                    description: {
                        contains: q,
                        mode: "insensitive" as const,
                    },
                },
            ],
        }
        : {};

    const products = await db.product.findMany({
        where: {
            isActive: true,
            ...categoryFilter,
            ...searchFilter,
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
        orderBy: {
            createdAt: "desc",
        },
    });

    // Filtro por género (campo nuevo del perfil olfativo). Se aplica en memoria
    // para tolerar el cliente Prisma previo a la migración: si ningún producto
    // tiene género aún, el filtro no se aplica (no vaciamos el catálogo).
    type WithGenero = { genero?: string | null };
    const hasGeneroData = products.some((p) => (p as WithGenero).genero);
    const generoProducts =
        genero && hasGeneroData
            ? products.filter(
                  (p) => ((p as WithGenero).genero ?? "").toLowerCase() === genero
              )
            : products;

    // "Lo nuevo" mantiene el orden por fecha; el resto se mezcla (Fisher-Yates)
    const shuffledProducts = [...generoProducts];
    if (orden !== "recientes") {
        for (let i = shuffledProducts.length - 1; i > 0; i--) {
            // eslint-disable-next-line react-hooks/purity
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledProducts[i], shuffledProducts[j]] = [shuffledProducts[j], shuffledProducts[i]];
        }
    }

    const normalizedProducts = shuffledProducts.map((product) => ({
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

    return (
        <main className="min-h-screen bg-cream">
            <Navbar />
            <CatalogSearchTracker query={q} />

            <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-[1560px] mx-auto">
                {/* Header editorial: eyebrow con guiones + Fraunces + hairline champán */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <p className="eyebrow mb-4">Colección</p>
                    <h1 className="font-serif text-5xl md:text-6xl text-cacao font-medium">
                        Nuestra colección
                    </h1>
                    <span className="hairline-v h-10 mt-5 mb-4" aria-hidden="true" />
                    <p className="font-sans text-warm-gray max-w-2xl mx-auto font-light">
                        Perfumería original y alternativas 1.1 de alta fidelidad, elegidas una a una.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:items-end lg:justify-between mb-10">
                    <form className="flex w-full lg:max-w-md gap-3" action="/catalogo" method="GET">
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Buscar productos..."
                            className="w-full border border-blush/50 bg-beige px-4 py-3 text-sm text-cacao outline-none focus:border-gold"
                        />
                        {categoria ? <input type="hidden" name="categoria" value={categoria} /> : null}
                        <button
                            type="submit"
                            className="bg-warm-black text-on-dark px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold-dark transition-colors"
                        >
                            Buscar
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/catalogo"
                            className={`px-4 py-2 border text-xs uppercase tracking-[0.2em] transition-colors ${!categoria
                                    ? "bg-cacao text-cream border-cacao"
                                    : "border-blush text-cacao hover:border-gold hover:text-gold"
                                }`}
                        >
                            Todos
                        </Link>

                        {validCategories.map((item) => (
                            <Link
                                key={item}
                                href={`/catalogo?categoria=${item}`}
                                className={`px-4 py-2 border text-xs uppercase tracking-[0.2em] transition-colors ${categoria === item
                                        ? "bg-cacao text-cream border-cacao"
                                        : "border-blush text-cacao hover:border-gold hover:text-gold"
                                    }`}
                            >
                                {item}
                            </Link>
                        ))}
                        <span className="hidden lg:block w-px self-stretch bg-blush" aria-hidden="true" />
                        {validGeneros.map((item) => (
                            <Link
                                key={item}
                                href={`/catalogo?genero=${item}${categoria ? `&categoria=${categoria}` : ""}`}
                                className={`px-4 py-2 border text-xs uppercase tracking-[0.2em] transition-colors ${genero === item
                                        ? "bg-cacao text-cream border-cacao"
                                        : "border-blush text-cacao hover:border-gold hover:text-gold"
                                    }`}
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>

                {normalizedProducts.length === 0 ? (
                    <div className="py-24 text-center">
                        <h2 className="font-serif text-3xl text-cacao mb-3">
                            No encontramos productos
                        </h2>
                        <p className="font-sans text-warm-gray mb-6">
                            Intenta con otra búsqueda o cambia el filtro de categoría.
                        </p>
                        <Link
                            href="/catalogo"
                            className="inline-block bg-warm-black text-on-dark px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold-dark transition-colors"
                        >
                            Ver todo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-x-5 gap-y-10">
                        {normalizedProducts.map((product) => (
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