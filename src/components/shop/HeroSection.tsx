import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="relative min-h-[88vh] flex items-center bg-cream overflow-hidden pt-20">
            {/* Imagen de fondo (la misma del hero de Shopify: emanella-home-hero) */}
            <Image
                src="/home-hero.png"
                alt="Perfume Emanella sobre fondo lila con pétalos y flores"
                fill
                priority
                sizes="100vw"
                className="object-cover object-right md:object-center"
            />

            {/* Overlay suave: la imagen ya es lila polvo; solo asegura legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-cream/80 via-cream/40 to-transparent z-10" />

            {/* Contenido */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl animate-[slideInRight_0.8s_ease-out]">
                    <p className="eyebrow mb-5">Perfumería original y 1.1</p>
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium text-cacao leading-[1.08] mb-6">
                        Que te recuerden
                        <br />
                        por cómo <span className="italic text-gold-dark">hueles</span>
                    </h1>
                    <p className="font-sans text-cacao-light text-base md:text-lg mb-10 max-w-lg font-light leading-relaxed">
                        Perfumería original y alternativas 1.1 de alta fidelidad, elegidas una a
                        una. Calidad de autor a un precio que sí tiene sentido.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <Link
                            href="/catalogo"
                            className="bg-warm-black text-on-dark px-10 py-4 font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors duration-300 text-center"
                        >
                            Explorar la colección
                        </Link>
                        <Link
                            href="/catalogo?orden=recientes"
                            className="font-sans text-[11px] tracking-[0.2em] uppercase text-cacao border-b border-gold pb-1 hover:text-gold-dark transition-colors duration-300 text-center sm:text-left w-fit mx-auto sm:mx-0"
                        >
                            Lo nuevo →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
