//src/app/product/[slug]/page.tsx
import db from "@/lib/db";
import { Navbar, Footer, AddToCartSection, ProductGallery } from "@/components/shop";
import { notFound } from "next/navigation";

type ProductPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
    const { slug } = await params;

    const product = await db.product.findUnique({
        where: { slug },
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
            },
        },
    });

    if (!product || !product.isActive) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-cream">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                    <ProductGallery
                        images={product.images}
                        productName={product.name}
                    />

                    <div className="flex flex-col justify-center">
                        <nav className="mb-6">
                            <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase">
                                {product.category}
                            </span>
                        </nav>

                        <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light mb-6 leading-tight">
                            {product.name}
                        </h1>

                        <div className="mb-8">
                            <h2 className="font-sans text-[10px] tracking-[0.2em] text-warm-gray uppercase mb-2">
                                Descripción
                            </h2>
                            <p className="font-sans text-warm-gray leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <AddToCartSection
                            product={{
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                imageUrl: product.images[0]?.imageUrl || null
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

                        <div className="mt-10 pt-8 border-t border-blush/30">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 bg-white/50">
                                    <p className="font-sans text-[10px] tracking-widest text-warm-gray uppercase mb-1">
                                        Envío
                                    </p>
                                    <p className="font-sans text-sm text-cacao">
                                        A coordinar
                                    </p>
                                </div>
                                <div className="p-4 bg-white/50">
                                    <p className="font-sans text-[10px] tracking-widest text-warm-gray uppercase mb-1">
                                        Pago
                                    </p>
                                    <p className="font-sans text-sm text-cacao">
                                        Contraentrega
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white/30 py-20 border-t border-blush/20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="font-serif text-3xl text-cacao mb-6 italic">Compromiso Emanella</h2>
                    <p className="font-sans text-warm-gray font-light leading-relaxed">
                        Cada uno de nuestros productos es seleccionado bajo los más altos estándares de calidad.
                        Nuestras fragancias son 100% originales y nuestros accesorios cuentan con acabados premium
                        para asegurar durabilidad y distinción.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
