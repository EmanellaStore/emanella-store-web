import { Navbar, Footer } from "@/components/shop";
import Image from "next/image";

export default function SobreNosotrosPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Imagen editorial (la misma de la página de Shopify) */}
          <div className="relative aspect-[16/10] overflow-hidden border border-blush mb-12">
            <Image
              src="/sobre-nosotros.png"
              alt="El mundo Emanella: perfumes elegidos uno a uno"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-center text-center mb-10">
            <p className="eyebrow mb-4">Sobre nosotros</p>
            <h1 className="font-serif text-4xl md:text-5xl text-cacao font-medium">
              El buen perfume, al alcance de tu piel
            </h1>
            <span className="hairline-v h-10 mt-6" aria-hidden="true" />
          </div>
          <div className="max-w-none text-cacao-light space-y-6">
            <p className="font-sans font-light leading-relaxed">
              <strong className="text-cacao font-medium">Emanella</strong> nace de una idea
              simple: oler increíble no debería depender de cuánto gastas. Elegimos cada
              fragancia —original o alternativa 1.1— por su calidad, su proyección y la
              historia que cuenta sobre tu piel. Sin humo, sin poses: perfume que se siente
              caro porque es bueno.
            </p>
            <p className="font-sans font-light leading-relaxed">
              Realizamos envíos a toda Colombia con guía de rastreo y confirmamos cada
              pedido por WhatsApp. Cada fragancia se elige una a una, con criterio de
              perfumería: concentración, familia olfativa, duración y fidelidad.
            </p>
            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Nuestros valores</h2>
            <ul className="list-disc list-inside space-y-2 font-sans font-light">
              <li><strong className="text-cacao font-medium">Calidad:</strong> originales y 1.1 de verdad, elegidos uno a uno.</li>
              <li><strong className="text-cacao font-medium">Transparencia:</strong> te decimos qué es original y qué es alternativa 1.1, siempre.</li>
              <li><strong className="text-cacao font-medium">Cercanía:</strong> te asesoramos por WhatsApp para encontrar el tuyo.</li>
              <li><strong className="text-cacao font-medium">Confianza:</strong> paga con tranquilidad y rastrea tu pedido.</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
