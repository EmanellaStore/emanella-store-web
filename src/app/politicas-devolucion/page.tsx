import { Navbar, Footer } from "@/components/shop";

export default function PoliticasDevolucionPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light text-center mb-8">
            Políticas de Devolución
          </h1>
          <div className="prose prose-lg max-w-none text-warm-gray space-y-6 font-sans leading-relaxed">
            <p>
              En <strong className="text-cacao">Emanella Store</strong>, queremos que estés completamente 
              satisfecho con tu compra. A continuación, te presentamos nuestras políticas de devolución.
            </p>
            
            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Condiciones Generales</h2>
            <p>
              Para proceder con una devolución o cambio, es necesario que se cumplan las siguientes 
              condiciones:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>El producto debe estar en su estado original, sin usar y con todas sus etiquetas</li>
              <li>Debes contactarnos dentro de los 5 días hábiles siguientes a la recepción</li>
              <li>Debes proporcionar el número de pedido y motivo de la devolución</li>
              <li>El producto debe devolverse en su empaque original o uno similar</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Productos No Retornables</h2>
            <p>Por razones de higiene, los siguientes productos no pueden ser devueltos:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Perfumes que hayan sido abiertos o utilizados</li>
              <li>Productos que hayan sido personalizados a tu solicitud</li>
              <li>Productos en oferta o promoción (a menos que estén defectuosos)</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Productos Defectuosos o Equivocados</h2>
            <p>
              Si recibiste un producto defectuoso, dañado o incorrecto, por favor contáctanos 
              inmediatamente a través de WhatsApp o email con:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Tu número de pedido</li>
              <li>Descripción del problema</li>
              <li>Fotografías del producto</li>
            </ul>
            <p>
              En estos casos, cubriremos el costo del envío de devolución y te enviaremos un 
              producto de reemplazo sin costo adicional.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Proceso de Devolución</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contacta a nuestro equipo por WhatsApp o email</li>
              <li>Recibe autorización y instrucciones de envío</li>
              <li>Envía el producto a la dirección indicada</li>
              <li>Una vez recibido y verificado, procesamos tu reembolso o cambio</li>
            </ol>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Reembolsos</h2>
            <p>
              Una vez recibido y aprobado tu producto devuelto:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Los reembolsos se procesan en 5-10 días hábiles</li>
              <li>El reembolso se hará al mismo método de pago utilizado en la compra</li>
              <li>Para pagos contraentrega, el reembolso se hará vía transferencia bancaria</li>
            </ul>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Cambios</h2>
            <p>
              Si deseas cambiar un producto por otro (talla, color, etc.), contáctanos y 
              verificaremos disponibilidad. El cliente cubre el costo del envío para cambios 
              por preferencia personal.
            </p>

            <h2 className="font-serif text-2xl text-cacao mt-10 mb-4">Contacto</h2>
            <p>
              Para iniciar cualquier proceso de devolución o cambio, contáctanos a través de:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-cacao">WhatsApp:</strong> +57 300 123 4567</li>
              <li><strong className="text-cacao">Email:</strong> contacto@emanella.com</li>
            </ul>
            <p>
              Nuestro horario de atención es de lunes a viernes, 9:00 AM - 6:00 PM.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
