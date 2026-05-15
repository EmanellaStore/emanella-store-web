import { Navbar, ProductCard, Footer } from "@/components/shop";
import db from "@/lib/db";
import Link from "next/link";

type CatalogPageProps = {
    searchParams?: Promise<{
        categoria?: string;
        q?: string;
    }>;
};

const validCategories = ["perfumes", "bolsos", "accesorios", "zapatos"];

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const params = await searchParams;
    const categoria = typeof params?.categoria === "string" ? params.categoria.toLowerCase() : "";
    const q = typeof params?.q === "string" ? params.q.trim() : "";

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
                take: 1,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const normalizedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.images[0]?.imageUrl || null,
        category: product.category,
        minPrice: product.variants.length > 0 ? Number(product.variants[0].price) : 0,
    }));

    return (
        <main className="min-h-screen bg-cream">
            <Navbar />

            <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <p className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase mb-4">
                        Catálogo
                    </p>
                    <h1 className="font-serif text-5xl md:text-6xl text-cacao font-light">
                        Nuestra colección
                    </h1>
                    <p className="font-sans text-warm-gray mt-4 max-w-2xl mx-auto">
                        Perfumes, bolsos y accesorios seleccionados para resaltar elegancia y estilo.
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
                            className="bg-gold text-cream px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold-dark transition-colors"
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
                            className="inline-block bg-gold text-cream px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold-dark transition-colors"
                        >
                            Ver todo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                        {normalizedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                slug={product.slug}
                                imageUrl={product.imageUrl}
                                category={product.category}
                                price={product.minPrice}
                            />
                        ))}
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}