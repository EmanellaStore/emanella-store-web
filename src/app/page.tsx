import { Navbar, HeroSection, ProductCard, Footer } from "@/components/shop";
import { getFeaturedProducts } from "@/services";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <main className="min-h-screen bg-cream w-full flex flex-col">
      <Navbar />
      <HeroSection />

      {/* Categorías destacadas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Perfumería", img: "/cat-perfumes.png", link: "/catalogo?categoria=perfumes" },
            { name: "Bolsos de Lujo", img: "/cat-bolsos.png", link: "/catalogo?categoria=bolsos" },
            { name: "Accesorios", img: "/cat-accesorios.png", link: "/catalogo?categoria=accesorios" },
          ].map((cat) => (
            <Link key={cat.name} href={cat.link} className="group block relative h-64 md:h-80 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-blush-dark/30">
                {/* Fallback color in case image is missing */}
                <div className="w-full h-full bg-blush opacity-20" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-cacao/80 via-cacao/20 to-transparent z-10" />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="font-serif text-2xl text-white mb-2">{cat.name}</h3>
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/80 group-hover:text-gold transition-colors flex items-center gap-2">
                  Explorar <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-beige py-24 border-y border-blush/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase mb-3">Favoritos de nuestras clientas</span>
            <h2 className="font-serif text-4xl md:text-5xl text-cacao font-light">Best Sellers</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                imageUrl={product.images[0]?.imageUrl || null}
                hoverImageUrl={product.images[1]?.imageUrl || null}
                category={product.category}
                price={product.variants[0]?.price ? Number(product.variants[0].price) : 0}
              />
            ))}
          </div>
          
          <div className="mt-16 text-center">
             <Link href="/catalogo" className="inline-block px-10 py-3.5 border border-cacao text-cacao font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-cacao hover:text-warm-black transition-colors duration-300 rounded-full">
               Ver todos los productos
             </Link>
          </div>
        </div>
      </section>

      {/* Banner Promocional Elegante */}
      <section className="relative py-32 overflow-hidden bg-blush/30">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23F4A6C1\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-cacao font-light mb-6">
            Lujo <span className="italic text-gold-dark font-medium">accesible</span> para todos los días
          </h2>
          <p className="font-sans text-cacao-light text-lg mb-8 font-light">
            Recibe 15% de descuento en tu primera compra usando el código <strong className="font-medium text-cacao">BIENVENIDA15</strong>.
          </p>
          <Link href="/catalogo" className="inline-block bg-cacao text-warm-black px-8 py-4 font-sans text-[11px] tracking-[0.2em] uppercase hover:bg-gold-dark hover:text-warm-black transition-colors duration-300 shadow-xl shadow-cacao/10 rounded-full">
            Descubrir Ofertas
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
