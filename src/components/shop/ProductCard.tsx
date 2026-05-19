import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  slug: string;
  imageUrl?: string | null;
  hoverImageUrl?: string | null;
  category: string;
  price: number;
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function ProductCard({
  name,
  slug,
  imageUrl,
  hoverImageUrl,
  category,
  price,
}: ProductCardProps) {
  const hasImage = Boolean(imageUrl && imageUrl.trim() !== "");

  return (
    <Link href={`/producto/${slug}`} className="group block h-full flex flex-col">
      <div className="relative aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden mb-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-white/5 transition-all duration-500 group-hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] group-hover:-translate-y-1">
        {hasImage ? (
          <>
            <Image
              src={imageUrl!}
              alt={name}
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-all duration-1000 group-hover:scale-105 ${hoverImageUrl ? "group-hover:opacity-0" : ""}`}
            />
            {hoverImageUrl && (
              <Image
                src={hoverImageUrl}
                alt={`${name} alternativa`}
                fill
                quality={100}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover absolute inset-0 opacity-0 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cream to-blush/20 text-center px-6">
            <span className="font-serif text-2xl text-cacao mb-2">Emanella</span>
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-warm-gray">
              Próximamente imagen
            </span>
          </div>
        )}

        {/* Etiqueta de Nuevo/Destacado (adaptada a modo oscuro pastel) */}
        <div className="absolute top-4 left-4 bg-warm-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="font-sans text-[9px] tracking-wider uppercase text-cacao font-medium">Vista rápida</span>
        </div>

        <div className="absolute inset-0 bg-cacao/0 group-hover:bg-cacao/10 transition-colors duration-500" />
      </div>

      <div className="space-y-1.5 text-center flex-1 flex flex-col">
        <p className="font-sans text-[10px] tracking-[0.2em] text-warm-gray uppercase">
          {formatCategory(category)}
        </p>
        <h3 className="font-serif text-xl text-cacao transition-colors duration-300 line-clamp-2 leading-tight">
          {name}
        </h3>
        <p className="font-sans text-sm text-gold-dark font-medium mt-auto pt-2">
          Desde ${price.toLocaleString("es-CO")}
        </p>
      </div>
    </Link>
  );
}