import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-warm-black text-on-dark border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 md:gap-8">
          <div className="md:pr-10">
            <Link href="/" aria-label="Emanella Perfumería — Inicio" className="inline-block">
              {/* Logo blanco (el mismo del tema Shopify) */}
              <Image
                src="/logo-emanella-white.png"
                alt="Emanella Perfumería"
                width={200}
                height={56}
                className="h-12 w-auto md:h-14"
              />
            </Link>
            <p className="mt-5 font-sans text-sm text-on-dark/65 leading-relaxed font-light">
              Perfumería original y alternativas 1.1 de alta fidelidad. Calidad de
              autor a un precio que sí tiene sentido.
            </p>
          </div>

          <div>
            <h3 className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase mb-5 font-medium">
              Tienda
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Inicio", path: "/" },
                { name: "Catálogo", path: "/catalogo" },
                { name: "Ofertas", path: "/ofertas" },
                { name: "Contacto", path: "/contacto" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="font-sans text-sm text-on-dark/65 hover:text-gold transition-colors font-light relative inline-block group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase mb-5 font-medium">
              Legal
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Sobre nosotros", path: "/sobre-nosotros" },
                { name: "Políticas de privacidad", path: "/politicas-privacidad" },
                { name: "Términos y condiciones", path: "/terminos-condiciones" },
                { name: "Políticas de devolución", path: "/politicas-devolucion" },
                { name: "Políticas de envío", path: "/politicas-envio" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="font-sans text-sm text-on-dark/65 hover:text-gold transition-colors font-light relative inline-block group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase mb-5 font-medium">
              Contacto
            </h3>
            <ul className="space-y-3 font-light">
              <li>
                <a
                  href="https://wa.me/+573170302862"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm text-on-dark/65 hover:text-gold transition-colors"
                >
                  WhatsApp: +57 317 030 2862
                </a>
              </li>
              <li>
                <span className="font-sans text-sm text-on-dark/65">
                  Email: admin_store@emanellastore.com
                </span>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.instagram.com/emanella.store/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-on-dark/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300 hover:scale-105 hover:bg-gold/5"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61588962472270"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-on-dark/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300 hover:scale-105 hover:bg-gold/5"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@emanella.store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-on-dark/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300 hover:scale-105 hover:bg-gold/5"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.22-2.52.93-5.06 2.95-6.55 1.58-1.14 3.56-1.6 5.51-1.34v4.02c-1.53-.16-3.11.23-4.22 1.25-.97.87-1.45 2.19-1.28 3.5.15 1.13.88 2.14 1.88 2.65 1.09.56 2.4.61 3.53.18 1.17-.45 2.05-1.45 2.37-2.67.18-.7.21-1.43.2-2.15V0h3.98z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-on-dark/15 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="font-sans text-[10px] uppercase text-on-dark/65 tracking-widest">
            © {new Date().getFullYear()} Emanella Store. Todos los derechos reservados.
          </p>
          <p className="font-sans text-[10px] uppercase text-on-dark/65 tracking-widest text-center">
            Envíos a toda Colombia con guía de rastreo
          </p>
        </div>
      </div>
    </footer>
  );
}
