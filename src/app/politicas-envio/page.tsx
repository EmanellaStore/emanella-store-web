import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/shop";

export const metadata: Metadata = {
  title: "Políticas de Envío | Emanella Store",
  description:
    "Consulta nuestros tiempos de entrega, costos de envío y cobertura en Colombia. En Emanella Store llevamos la elegancia hasta tu puerta.",
};

export default function PoliticasEnvioPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light text-center mb-4">
            Políticas de Envío
          </h1>
          <p className="text-center font-sans text-sm text-warm-gray tracking-widest mb-12">
            Última actualización: Mayo 2025
          </p>

          <div className="space-y-10 font-sans text-warm-gray leading-relaxed">
            <p>
              En <strong className="text-cacao">Emanella Store</strong>, nos esforzamos por garantizar 
              que tus productos lleguen de forma segura y en el menor tiempo posible. Trabajamos con 
              las transportadoras más confiables del país para asegurar una experiencia de entrega 
              premium.
            </p>

            {/* --- COBERTURA --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">1. Cobertura y Destinos</h2>
              <p>
                Realizamos envíos a todo el territorio nacional de <strong className="text-cacao">Colombia</strong>. 
                Nuestra red logística cubre ciudades principales, municipios intermedios y zonas rurales 
                con acceso terrestre.
              </p>
            </div>

            {/* --- COSTOS --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">2. Costos de Envío</h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-cacao">Envío Estándar:</strong> Tiene un costo fijo de{" "}
                  <strong className="text-cacao">$15.000 COP</strong> para cualquier destino nacional.
                </li>
                <li>
                  <strong className="text-cacao">Envío Gratis:</strong> Por compras superiores a{" "}
                  <strong className="text-cacao">$200.000 COP</strong>, el envío no tendrá ningún costo 
                  para ti.
                </li>
              </ul>
            </div>

            {/* --- TIEMPOS --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">3. Tiempos de Entrega</h2>
              <p className="mb-3">
                Los tiempos de entrega comienzan a contar a partir de la confirmación del pedido 
                (o validación del pago en caso de transferencia):
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-cacao">Ciudades Principales (Bogotá, Medellín, Cali, Barranquilla):</strong>{" "}
                  2 a 3 días hábiles.
                </li>
                <li>
                  <strong className="text-cacao">Resto del País:</strong> 3 a 5 días hábiles.
                </li>
                <li>
                  <strong className="text-cacao">Zonas de difícil acceso:</strong> Hasta 8 días hábiles.
                </li>
              </ul>
              <p className="mt-3 text-sm italic">
                *Nota: En temporadas especiales (Black Friday, Navidad, etc.), los tiempos pueden extenderse 
                ligeramente debido a la alta demanda de las transportadoras.
              </p>
            </div>

            {/* --- SEGUIMIENTO --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">4. Seguimiento de Pedidos</h2>
              <p>
                Una vez tu pedido sea despachado, recibirás un número de guía a través de WhatsApp 
                o correo electrónico. Puedes consultar el estado de tu envío en nuestra sección de{" "}
                <a href="/track" className="text-cacao underline underline-offset-4 font-medium">Seguimiento</a>{" "}
                o directamente en la página de la transportadora asignada (Coordinadora, Servientrega o Envia).
              </p>
            </div>

            {/* --- CONTRAENTREGA --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">5. Pago Contraentrega</h2>
              <p>
                Contamos con servicio de <strong className="text-cacao">Pago Contraentrega</strong> en 
                el 90% del territorio nacional. En esta modalidad, pagas el valor total de tu pedido 
                en efectivo al momento de recibirlo. Asegúrate de tener el monto exacto disponible 
                para agilizar la entrega.
              </p>
            </div>

            {/* --- NOVEDADES --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">6. Novedades y Fallos en la Entrega</h2>
              <p className="mb-3">
                Es responsabilidad del cliente proporcionar una dirección exacta y un número de 
                contacto válido.
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  Si la transportadora no logra realizar la entrega tras 2 intentos, el pedido será 
                  devuelto a nuestra bodega.
                </li>
                <li>
                  En caso de errores en la dirección proporcionada por el cliente, este deberá 
                  asumir el costo del reenvío.
                </li>
                <li>
                  Si el paquete llega con signos de haber sido abierto o dañado, por favor no lo 
                  recibas y anota la novedad en la guía de la transportadora.
                </li>
              </ul>
            </div>

            {/* --- CONTACTO --- */}
            <div className="bg-white/60 border border-blush/30 p-6 rounded-sm">
              <h2 className="font-serif text-2xl text-cacao mb-4">7. Soporte Logístico</h2>
              <p className="mb-4">
                Si tienes dudas sobre el estado de tu envío, comunícate con nosotros:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong className="text-cacao">WhatsApp:</strong>{" "}
                  <a
                    href="https://wa.me/573170302862"
                    className="hover:text-cacao transition-colors underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +57 317 030 2862
                  </a>
                </li>
                <li>
                  <strong className="text-cacao">Email:</strong>{" "}
                  <a
                    href="mailto:admin_store@emanellastore.com"
                    className="hover:text-cacao transition-colors underline underline-offset-2"
                  >
                    admin_store@emanellastore.com
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
