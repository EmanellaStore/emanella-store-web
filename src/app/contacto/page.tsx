import { Navbar, Footer } from "@/components/shop";

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cacao font-light text-center mb-8">
            Contacto
          </h1>
          <div className="prose prose-lg max-w-none text-warm-gray space-y-6">
            <p className="font-sans leading-relaxed text-center mb-10">
              ¿Tienes alguna duda o consulta? Estamos aquí para ayudarte a encontrar 
              el producto perfecto. Contáctanos a través de nuestros canales oficiales.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              {/* WhatsApp Ventas */}
              <div className="bg-beige border border-blush/30 p-8 text-center rounded-2xl shadow-lg shadow-black/10 flex flex-col justify-between items-center">
                <div>
                  <div className="w-12 h-12 bg-cacao/10 text-cacao rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-xl text-cacao mb-2">WhatsApp Ventas</h2>
                  <p className="font-sans text-xs text-warm-gray mb-6">
                    Asesoría para comprar y dudas sobre productos.
                  </p>
                </div>
                <a
                  href="https://wa.me/+573170302862"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block bg-warm-black text-on-dark px-4 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold-dark transition-colors"
                >
                  Contactar Ventas
                </a>
              </div>

              {/* WhatsApp Soporte */}
              <div className="bg-beige border border-blush/30 p-8 text-center rounded-2xl shadow-lg shadow-black/10 flex flex-col justify-between items-center">
                <div>
                  <div className="w-12 h-12 bg-cacao/10 text-cacao rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-xl text-cacao mb-2">WhatsApp Soporte</h2>
                  <p className="font-sans text-xs text-warm-gray mb-6">
                    Seguimiento de pedidos y problemas post-venta.
                  </p>
                </div>
                <a
                  href="https://wa.me/+573170302862"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block bg-warm-black text-on-dark px-4 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold-dark transition-colors"
                >
                  Contactar Soporte
                </a>
              </div>

              {/* Email */}
              <div className="bg-beige border border-blush/30 p-8 text-center rounded-2xl shadow-lg shadow-black/10 flex flex-col justify-between items-center">
                <div>
                  <div className="w-12 h-12 bg-cacao/10 text-cacao rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h2 className="font-serif text-xl text-cacao mb-2">Email</h2>
                  <p className="font-sans text-xs text-warm-gray mb-6">
                    Consultas formales. Responderemos en un plazo de 24 horas.
                  </p>
                </div>
                <a
                  href="mailto:admin_store@emanellastore.com"
                  className="w-full inline-block border border-cacao text-cacao px-4 py-3 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-cream hover:border-gold transition-colors"
                >
                  Enviar Correo
                </a>
              </div>
            </div>

            <div className="mt-16 text-center">
              <h2 className="font-serif text-2xl text-cacao mb-6">Síguenos en Redes</h2>
              <div className="flex justify-center gap-6">
                <a
                  href="https://www.instagram.com/emanella.store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full border border-blush text-cacao flex items-center justify-center hover:bg-gold hover:text-cream hover:border-gold transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61588962472270"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full border border-blush text-cacao flex items-center justify-center hover:bg-gold hover:text-cream hover:border-gold transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@emanella.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full border border-blush text-cacao flex items-center justify-center hover:bg-gold hover:text-cream hover:border-gold transition-all duration-300 hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.22-2.52.93-5.06 2.95-6.55 1.58-1.14 3.56-1.6 5.51-1.34v4.02c-1.53-.16-3.11.23-4.22 1.25-.97.87-1.45 2.19-1.28 3.5.15 1.13.88 2.14 1.88 2.65 1.09.56 2.4.61 3.53.18 1.17-.45 2.05-1.45 2.37-2.67.18-.7.21-1.43.2-2.15V0h3.98z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
