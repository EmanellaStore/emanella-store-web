import { Navbar, Footer } from "@/components/shop";

export default function SobreNosotrosPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light text-center mb-8">
            Sobre Nosotros
          </h1>
          <div className="prose prose-lg max-w-none text-warm-gray space-y-6">
            <p className="font-sans leading-relaxed">
              <strong className="text-cacao">Emanella Store</strong> es una tienda online especializada en perfumes, 
              bolsos y accesorios de alta calidad. Nacimos con la visión de ofrecer productos exclusivos 
              que combinen elegancia, sofisticación y accesibilidad.
            </p>
            <p className="font-sans leading-relaxed">
              Cada producto en nuestra tienda es cuidadosamente seleccionado para garantizar la mejor 
              calidad y experiencia para nuestros clientes. Trabajamos con marcas reconocidas y productos 
              que cumplen con los más altos estándares.
            </p>
            <p className="font-sans leading-relaxed">
              Nuestra misión es hacer que la elegancia sea accesible para todos, ofreciendo una 
              experiencia de compra única y personalizada. Nos esforzamos por superar las expectativas 
              de nuestros clientes en cada interacción.
            </p>
            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Nuestros Valores</h2>
            <ul className="list-disc list-inside space-y-2 font-sans">
              <li><strong className="text-cacao">Calidad:</strong> Solo ofrecemos productos que cumplen con nuestros estándares.</li>
              <li><strong className="text-cacao">Autenticidad:</strong> Todos nuestros productos son 100% originales.</li>
              <li><strong className="text-cacao">Confianza:</strong> Tu satisfacción es nuestra prioridad.</li>
              <li><strong className="text-cacao">Elegancia:</strong> Productos seleccionados para destacar tu estilo.</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
