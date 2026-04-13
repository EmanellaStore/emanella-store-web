import Navbar from "./components/shop/Navbar";
import HeroSection from "./components/shop/HeroSection"; 
import ProductCard from "./components/shop/ProductCard";

const featuredProducts = [
  { id: '1', name: 'Ethereal Bloom', slug: 'ethereal-bloom', category: 'Perfumes', price: 245000, imageUrl: '' },
  { id: '2', name: 'Midnight Velvet', slug: 'midnight-velvet', category: 'Perfumes', price: 189000, imageUrl: '' },
  { id: '3', name: 'Golden Hour', slug: 'golden-hour', category: 'Accesorios', price: 120000, imageUrl: '' },
  { id: '4', name: 'Sienna Tote', slug: 'sienna-tote', category: 'Bolsos', price: 350000, imageUrl: '' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream w-full">
      <Navbar />
      <HeroSection />

      {/* Sección de Productos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="font-sans text-[10px] tracking-[0.5em] text-gold uppercase mb-4">Selección Especial</span>
          <h2 className="font-serif text-4xl md:text-5xl text-cacao font-light">Lo más destacado</h2>
          <div className="w-12 h-px bg-gold mt-6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="border-t border-blush/30 py-12 bg-white/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif text-xl text-cacao tracking-widest mb-4">Emanella Store</p>
          <p className="font-sans text-[10px] tracking-widest text-warm-gray uppercase">
            © {new Date().getFullYear()} — Elegancia en cada detalle
          </p>
        </div>
      </footer>
    </main>
  );
}