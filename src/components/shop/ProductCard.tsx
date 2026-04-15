import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  slug: string;
  imageUrl?: string | null;
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
  category,
  price,
}: ProductCardProps) {
  const hasImage = Boolean(imageUrl && imageUrl.trim() !== "");

  return (
    <Link href={`/producto/${slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-blush/10 overflow-hidden mb-4">
        {hasImage ? (
          <Image
            src={imageUrl!}
            alt={name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cream to-blush/20 text-center px-6">
            <span className="font-serif text-2xl text-cacao mb-2">Emanella</span>
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-warm-gray">
              Próximamente imagen
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-cacao/0 group-hover:bg-cacao/5 transition-colors duration-500" />
      </div>

      <div className="space-y-1 text-center">
        <p className="font-sans text-[10px] tracking-[0.2em] text-warm-gray uppercase">
          {formatCategory(category)}
        </p>
        <h3 className="font-serif text-xl text-cacao group-hover:text-gold transition-colors">
          {name}
        </h3>
        <p className="font-sans text-sm text-gold-dark font-medium">
          Desde ${price.toLocaleString("es-CO")}
        </p>
      </div>
    </Link>
  );
}