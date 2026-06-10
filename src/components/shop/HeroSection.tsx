import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center bg-cream overflow-hidden pt-20">
            {/* Imagen de fondo */}
            <Image
                src="/hero-banner.png"
                alt="Emanella Store Hero"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center md:object-right-top"
            />

            {/* Overlay gradiente más sofisticado */}
            <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-cream/50 to-transparent z-10" />

            {/* Contenido */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl animate-[slideInRight_0.8s_ease-out]">
                    <span className="inline-block font-sans text-[10px] tracking-[0.3em] text-cacao/70 uppercase mb-4 border-b border-gold/40 pb-1">
                        Exclusividad & Elegancia
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-cacao leading-[1.05] mb-6">
                        Descubre tu <br />
                        <span className="italic font-medium text-gold relative">
                            esencia perfecta
                            <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gold/30"></span>
                        </span>
                    </h1>
                    <p className="font-sans text-warm-gray text-base md:text-lg mb-10 max-w-md font-light leading-relaxed">
                        Sumérgete en nuestra cuidada selección de fragancias premium y accesorios de lujo. Diseñados para quienes aprecian los detalles.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5">
                        <Link
                            href="/catalogo"
                            className="bg-cacao text-cream px-8 py-3.5 font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 text-center shadow-lg shadow-cacao/10"
                        >
                            Comprar Ahora
                        </Link>
                        <Link
                            href="/catalogo?categoria=perfumes"
                            className="border border-cacao/20 text-cacao px-8 py-3.5 font-sans text-[11px] tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-colors duration-500 text-center bg-cream/30 backdrop-blur-sm"
                        >
                            Ver Colección
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}