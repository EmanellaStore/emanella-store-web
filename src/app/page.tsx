import { Navbar, HeroSection, ProductCard, Footer } from "@/components/shop";
import { getFeaturedProducts } from "@/services";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <main className="min-h-screen bg-cream w-full">
      <Navbar />
      <HeroSection />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="font-sans text-[10px] tracking-[0.5em] text-gold uppercase mb-4">Selección Especial</span>
          <h2 className="font-serif text-4xl md:text-5xl text-cacao font-light">Lo más destacado</h2>
          <div className="w-12 h-px bg-gold mt-6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              slug={product.slug}
              imageUrl={product.images[0]?.imageUrl || null}
              category={product.category}
              price={product.variants[0]?.price ? Number(product.variants[0].price) : 0}
            />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
