import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/shop";

export const metadata: Metadata = {
  title: "Políticas de Privacidad | Emanella Store",
  description:
    "Conoce cómo Emanella Store recopila, usa y protege tus datos personales. Tu privacidad es nuestra prioridad.",
};

export default function PoliticasPrivacidadPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light text-center mb-8">
            Políticas de Privacidad
          </h1>
          <div className="prose prose-lg max-w-none text-warm-gray space-y-6 font-sans leading-relaxed">
            <p>
              En <strong className="text-cacao">Emanella Store</strong>, nos comprometemos a proteger 
              la privacidad y seguridad de tus datos personales. Esta política describe cómo recopilamos, 
              usamos y protegemos tu información.
            </p>
            
            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Información que Recopilamos</h2>
            <p>
              Recopilamos información que nos proporcionas directamente, incluyendo:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Nombre y información de contacto (dirección, teléfono, email)</li>
              <li>Información de pago (procesada de forma segura)</li>
              <li>Historial de pedidos y preferencias</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Uso de tu Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Procesar y entregar tus pedidos</li>
              <li>Comunicarnos contigo sobre tu pedido</li>
              <li>Mejorar nuestros servicios</li>
              <li>Enviarte información sobre productos y promociones (solo si lo aceptas)</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tus 
              datos personales contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar información inexacta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al tratamiento de tus datos</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Contacto</h2>
            <p>
              Para cualquier consulta sobre nuestras políticas de privacidad, contáctanos a través de 
              nuestro WhatsApp o email.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
