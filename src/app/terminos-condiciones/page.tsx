import { Navbar, Footer } from "@/components/shop";

export default function TerminosCondicionesPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light text-center mb-8">
            Términos y Condiciones
          </h1>
          <div className="prose prose-lg max-w-none text-warm-gray space-y-6 font-sans leading-relaxed">
            <p>
              Bienvenido a <strong className="text-cacao">Emanella Store</strong>. Al usar nuestro 
              sitio web y realizar compras, aceptas los siguientes términos y condiciones.
            </p>
            
            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Información General</h2>
            <p>
              Emanella Store es una tienda online que opera en Colombia. Los precios de nuestros 
              productos están expresados en pesos colombianos (COP) e incluyen los impuestos 
              aplicables.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Proceso de Compra</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Selecciona los productos deseados y añádelos al carrito</li>
              <li>Completa la información de envío y contacto</li>
              <li>Selecciona el método de pago preferido</li>
              <li>Confirma tu pedido</li>
              <li>Recibirás un correo/SMS de confirmación</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Métodos de Pago</h2>
            <p>Aceptamos los siguientes métodos de pago:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-cacao">Pago contraentrega:</strong> Pagas al recibir tu pedido</li>
              <li><strong className="text-cacao">Transferencia bancaria:</strong> Pago anticipado via PSE o transferencia</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Envíos y Entregas</h2>
            <p>
              Los envíos se realizan a través de empresas de mensajería aliadas. Los tiempos de 
              entrega varían según la ubicación:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Bogotá: 2-5 días hábiles</li>
              <li>Ciudades principales: 3-7 días hábiles</li>
              <li>Otras zonas: 5-10 días hábiles</li>
            </ul>
            <p>
              Los costos de envío se calculan al momento de la compra y pueden variar según el 
              destino y el peso del pedido.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Precios y Disponibilidad</h2>
            <p>
              Los precios de nuestros productos están sujetos a cambios sin previo aviso. 
              nos esforzamos por mantener la precisión en los precios mostrados, pero pueden 
              ocurrir errores. En caso de un error de precio, te notificaremos antes de 
              confirmar tu pedido.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Propiedad Intelectual</h2>
            <p>
              Todo el contenido del sitio web (textos, imágenes, logotipos, diseño) está protegido 
              por derechos de autor y no puede ser reproducido sin autorización.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Limitación de Responsabilidad</h2>
            <p>
              Emanella Store no será responsable por daños indirectos, incidentales o 
              consecuentes derivados del uso de nuestros productos o servicios.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los 
              cambios entrarán en vigor inmediatamente después de su publicación en el sitio.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
