import { Navbar, HeroSection, ProductCard, Footer } from "@/components/shop";
import NewsletterSection from "@/components/shop/NewsletterSection";
import { getBestSellers, getNewestProducts } from "@/services";
import Link from "next/link";
import Image from "next/image";
import { Truck, BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react";

export const revalidate = 0;

type HomeProduct = Awaited<ReturnType<typeof getBestSellers>>[number];

function toCardProps(product: HomeProduct) {
  const variant = product.variants[0];
  return {
    name: product.name,
    slug: product.slug,
    imageUrl: product.images[0]?.imageUrl || null,
    hoverImageUrl: product.images[1]?.imageUrl || null,
    category: product.category,
    price: variant ? Number(variant.price) : 0,
    originalPrice: variant?.originalPrice ? Number(variant.originalPrice) : null,
    productId: product.id,
    variant: variant
      ? {
          id: variant.id,
          attributeName: variant.attributeName,
          attributeValue: variant.attributeValue,
        }
      : null,
  };
}

const generos = [
  { name: "Hombre", tagline: "Carácter que se queda", link: "/catalogo?genero=hombre", img: "/cat-hombre.png" },
  { name: "Dama", tagline: "Elegancia que envuelve", link: "/catalogo?genero=dama", img: "/cat-dama.png" },
  { name: "Unisex", tagline: "Para quien lo lleva bien", link: "/catalogo?genero=unisex", img: "/cat-unisex.png" },
];

const trustItems = [
  { icon: Truck, text: "Realizamos envíos a toda Colombia con guía de rastreo" },
  { icon: BadgeCheck, text: "Originales y 1.1 de verdad" },
  { icon: MessageCircle, text: "Confirmamos cada pedido por WhatsApp" },
  { icon: ShieldCheck, text: "Paga con tranquilidad" },
];

export default async function HomePage() {
  const [bestSellers, newest] = await Promise.all([
    getBestSellers(4),
    getNewestProducts(4),
  ]);

  return (
    <main className="min-h-screen bg-cream w-full flex flex-col">
      <Navbar />
      <HeroSection />

      {/* Encuentra el tuyo — Hombre · Dama · Unisex */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="eyebrow mb-3">Encuentra el tuyo</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-cacao">
            Un perfume para cada piel
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {generos.map((g) => (
            <Link key={g.name} href={g.link} className="group block">
              {/* Imagen de la colección (las mismas de Shopify: emanella-cat-*) */}
              <div className="relative aspect-square overflow-hidden border border-blush bg-beige">
                <Image
                  src={g.img}
                  alt={`Perfumes para ${g.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex flex-col items-center text-center">
                <h3 className="font-serif text-2xl md:text-3xl font-medium italic text-cacao">
                  {g.name}
                </h3>
                <p className="mt-1 font-sans text-sm font-light text-cacao-light">{g.tagline}</p>
                <span className="mt-3 font-sans text-[11px] uppercase tracking-[0.2em] text-cacao border-b border-gold pb-1 transition-colors group-hover:text-gold-dark">
                  Explorar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Los más deseados */}
      <section className="bg-beige py-20 border-y border-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12 text-center">
            <p className="eyebrow mb-3">Best sellers</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-cacao">
              Los más deseados
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} {...toCardProps(product)} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/catalogo"
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-cacao border-b border-gold pb-1 hover:text-gold-dark transition-colors"
            >
              Ver toda la colección →
            </Link>
          </div>
        </div>
      </section>

      {/* Recién llegados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col items-center mb-12 text-center">
          <p className="eyebrow mb-3">Novedades</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-cacao">
            Recién llegados
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {newest.map((product) => (
            <ProductCard key={product.id} {...toCardProps(product)} />
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-blush bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustItems.map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-3 text-center">
              <Icon size={22} strokeWidth={1.25} className="text-gold-dark" aria-hidden="true" />
              <p className="font-sans text-xs font-light leading-relaxed text-cacao-light max-w-[22ch]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Historia — image-with-text (misma imagen de Shopify: emanella-home-historia) */}
      <section className="bg-beige">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div className="relative aspect-square overflow-hidden border border-blush">
            <Image
              src="/home-historia.png"
              alt="Tocador con perfumes y flores — el mundo Emanella"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow mb-4">Nuestra historia</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-cacao leading-tight mb-6">
              El buen perfume, al alcance de tu piel
            </h2>
            <p className="font-sans font-light text-cacao-light leading-relaxed mb-8">
              Emanella nace de una idea simple: oler increíble no debería depender de
              cuánto gastas. Elegimos cada fragancia —original o alternativa 1.1— por su
              calidad, su proyección y la historia que cuenta sobre tu piel. Sin humo,
              sin poses: perfume que se siente caro porque es bueno.
            </p>
            <Link
              href="/sobre-nosotros"
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-cacao border-b border-gold pb-1 hover:text-gold-dark transition-colors"
            >
              Conócenos →
            </Link>
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </main>
  );
}
