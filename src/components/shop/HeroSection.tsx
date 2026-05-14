import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center bg-cream overflow-hidden pt-16">

            {/* Imagen de fondo con next/image (más control) */}
            <Image
                src="/hero-banner.png"
                alt="Emanella Store Hero"
                fill
                priority
                className="object-cover object-center"
            />

            {/* Overlay gradiente para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/85 to-cream/20 z-10" />

            {/* Contenido */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl">
                    <p className="font-sans text-xs tracking-[0.4em] text-gold uppercase mb-6">
                        Nueva Colección
                    </p>
                    <h1 className="font-serif text-6xl md:text-8xl font-light text-cacao leading-[1.1] mb-8">
                        El aroma que <br />
                        <span className="italic font-medium text-gold">te define</span>
                    </h1>
                    <p className="font-sans text-warm-gray text-lg mb-12 max-w-md font-light leading-relaxed">
                        Descubre nuestra selección exclusiva de fragancias y accesorios diseñados para resaltar tu esencia única.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link
                            href="/catalogo"
                            className="bg-gold text-cream px-10 py-4 font-sans text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-all duration-500 text-center"
                        >
                            Explorar Catálogo
                        </Link>
                        <Link
                            href="/catalogo?categoria=perfumes"
                            className="border border-cacao text-cacao px-10 py-4 font-sans text-xs tracking-[0.2em] uppercase hover:bg-cacao hover:text-cream transition-all duration-500 text-center"
                        >
                            Ver Perfumes
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}