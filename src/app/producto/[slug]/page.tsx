import db from "@/lib/db";
import Navbar from "../../components/shop/Navbar";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartSection from "@/app/components/shop/AddCartSection";

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
        },
    });

    if (!product || !product.isActive) {
        notFound();
    }

    const hasImage = Boolean(product.imageUrl && product.imageUrl.trim() !== "");

    return (
        <main className="min-h-screen bg-cream">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                    {/* Columna Izquierda: Imagen */}
                    <div className="relative aspect-[4/5] bg-blush/10 overflow-hidden">
                        {hasImage ? (
                            <Image
                                src={product.imageUrl!}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cream to-blush/20 text-center">
                                <span className="font-serif text-4xl text-cacao mb-4">Emanella</span>
                                <span className="font-sans text-xs tracking-[0.3em] uppercase text-warm-gray">
                                    Imagen en alta resolución próximamente
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha: Info y Selección */}
                    <div className="flex flex-col justify-center">
                        <nav className="mb-6">
                            <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase">
                                {product.category}
                            </span>
                        </nav>

                        <h1 className="font-serif text-5xl md:text-6xl text-cacao font-light mb-6 leading-tight">
                            {product.name}
                        </h1>

                        <p className="font-sans text-warm-gray text-lg mb-10 font-light leading-relaxed">
                            {product.description}
                        </p>

                        <AddToCartSection
                            product={{
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                imageUrl: product.imageUrl
                            }}
                            variants={product.variants.map((v) => ({
                                id: v.id,
                                sku: v.sku,
                                attributeName: v.attributeName,
                                attributeValue: v.attributeValue,
                                price: Number(v.price),   // ← Decimal → number nativo  
                                stock: v.stock,
                            }))}
                        />
                    </div>
                </div>
            </section>

            {/* Sección de Detalles Adicionales (Opcional/Estética) */}
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
        </main>
    );
}