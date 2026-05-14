import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/shop";

export const metadata: Metadata = {
  title: "Políticas de Devolución | Emanella Store",
  description:
    "Conoce nuestras políticas de devolución, cambio y reembolso. En Emanella Store garantizamos tu satisfacción con cada compra.",
};

export default function PoliticasDevolucionPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light text-center mb-4">
            Políticas de Devolución
          </h1>
          <p className="text-center font-sans text-sm text-warm-gray tracking-widest mb-12">
            Última actualización: Mayo 2025
          </p>

          <div className="space-y-10 font-sans text-warm-gray leading-relaxed">

            <p>
              En <strong className="text-cacao">Emanella Store</strong>, queremos que cada compra
              sea una experiencia satisfactoria. Si por algún motivo no estás conforme con tu
              pedido, hemos diseñado un proceso de devolución claro y justo para protegerte como
              consumidor, en cumplimiento con la normativa colombiana de protección al consumidor
              (Ley 1480 de 2011).
            </p>

            {/* --- CONDICIONES GENERALES --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">1. Condiciones Generales</h2>
              <p className="mb-3">
                Para proceder con una devolución o cambio, el producto debe cumplir las siguientes
                condiciones sin excepción:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  El producto debe estar en su estado original: sin uso, sin abrir (cuando aplique),
                  con todas sus etiquetas y sellos intactos.
                </li>
                <li>
                  Debes contactarnos dentro de los <strong className="text-cacao">5 días hábiles</strong>{" "}
                  siguientes a la fecha de recepción del pedido.
                </li>
                <li>Debes presentar el número de pedido y una descripción clara del motivo.</li>
                <li>
                  El producto debe devolverse en su empaque original o en uno que garantice su
                  protección durante el transporte.
                </li>
              </ul>
            </div>

            {/* --- NO RETORNABLES --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">2. Productos No Retornables</h2>
              <p className="mb-3">
                Por razones de higiene y seguridad, los siguientes productos <strong className="text-cacao">no
                pueden ser devueltos ni cambiados</strong>, salvo que presenten un defecto de
                fabricación comprobable:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Perfumes que hayan sido abiertos, usados o cuyo sello de seguridad esté roto.</li>
                <li>Productos de uso personal (accesorios íntimos, artículos de contacto directo con piel).</li>
                <li>Productos personalizados o elaborados bajo pedido especial.</li>
                <li>
                  Artículos adquiridos en promoción, liquidación o con descuento especial, salvo
                  que presenten defecto de fábrica.
                </li>
              </ul>
            </div>

            {/* --- DEFECTUOSOS --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">
                3. Productos Defectuosos o Incorrectos
              </h2>
              <p className="mb-3">
                Si recibiste un producto defectuoso, dañado durante el transporte o diferente al
                que ordenaste, por favor contáctanos de inmediato con la siguiente información:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Número de pedido.</li>
                <li>Descripción detallada del problema.</li>
                <li>Fotografías claras del producto y su empaque.</li>
              </ul>
              <p className="mt-3">
                En estos casos, <strong className="text-cacao">Emanella Store</strong> cubrirá el
                100% del costo del envío de devolución y gestionará el reemplazo del producto o el
                reembolso completo, según tu preferencia, sin costo adicional para ti.
              </p>
            </div>

            {/* --- PROCESO --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">4. Proceso de Devolución</h2>
              <p className="mb-3">Sigue estos pasos para iniciar tu solicitud:</p>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li>
                  <strong className="text-cacao">Contáctanos</strong> por WhatsApp o email dentro
                  del plazo permitido, indicando tu número de pedido y el motivo.
                </li>
                <li>
                  <strong className="text-cacao">Recibe autorización</strong>: te enviaremos un
                  número de autorización de devolución (RMA) y las instrucciones de envío.
                </li>
                <li>
                  <strong className="text-cacao">Empaca y envía</strong> el producto a la
                  dirección indicada, incluyendo el número RMA visible en el paquete.
                </li>
                <li>
                  <strong className="text-cacao">Verificación</strong>: una vez recibido el
                  paquete, inspeccionamos el producto en un plazo de 2 días hábiles.
                </li>
                <li>
                  <strong className="text-cacao">Resolución</strong>: aprobada la devolución,
                  procesamos el reembolso o el cambio según lo acordado.
                </li>
              </ol>
            </div>

            {/* --- REEMBOLSOS --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">5. Reembolsos</h2>
              <p className="mb-3">
                Una vez aprobada la devolución, aplicamos las siguientes condiciones de reembolso:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  Los reembolsos se procesan en un plazo de{" "}
                  <strong className="text-cacao">5 a 10 días hábiles</strong> desde la aprobación.
                </li>
                <li>
                  Para compras por <strong className="text-cacao">transferencia bancaria</strong>,
                  el reembolso se realizará a la misma cuenta bancaria de origen.
                </li>
                <li>
                  Para compras <strong className="text-cacao">contraentrega</strong>, el reembolso
                  se realizará mediante transferencia bancaria a la cuenta que nos indiques.
                </li>
                <li>
                  El valor del envío original no es reembolsable, excepto cuando la devolución sea
                  por error nuestro o defecto del producto.
                </li>
              </ul>
            </div>

            {/* --- CAMBIOS --- */}
            <div>
              <h2 className="font-serif text-2xl text-cacao mb-4">6. Cambios</h2>
              <p>
                Si deseas cambiar un producto por otra talla, color o presentación, contáctanos
                para verificar disponibilidad en inventario. Ten en cuenta que:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 mt-3">
                <li>
                  Los cambios por preferencia personal tienen un costo de envío a cargo del cliente
                  (ida y vuelta).
                </li>
                <li>
                  Los cambios por defecto de fabricación o error en el envío no generan costo
                  adicional.
                </li>
                <li>Solo se permite un cambio por pedido.</li>
              </ul>
            </div>

            {/* --- CONTACTO --- */}
            <div className="bg-white/60 border border-blush/30 p-6 rounded-sm">
              <h2 className="font-serif text-2xl text-cacao mb-4">7. Contacto</h2>
              <p className="mb-4">
                Para iniciar cualquier proceso de devolución o cambio, comunícate con nuestro
                equipo de atención al cliente:
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
              <p className="mt-4 text-sm">
                Horario de atención: <strong className="text-cacao">lunes a viernes, 9:00 AM – 6:00 PM</strong>{" "}
                (hora Colombia).
              </p>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
