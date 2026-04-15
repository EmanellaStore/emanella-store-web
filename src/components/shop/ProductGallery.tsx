"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImage {
  id: string;
  imageUrl: string;
  position: number;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : null;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const lightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const lightboxNext = () => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!hasImages) {
    return (
      <div className="relative aspect-[4/5] bg-blush/10 flex items-center justify-center">
        <div className="text-center">
          <span className="font-serif text-4xl text-cacao mb-4 block">Emanella</span>
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-warm-gray">
            Imagen en alta resolución próximamente
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative aspect-[4/5] bg-blush/10 overflow-hidden group">
          {currentImage && (
            <>
              <Image
                src={currentImage.imageUrl}
                alt={`${productName} - Imagen ${currentIndex + 1}`}
                fill
                className="object-cover cursor-zoom-in transition-opacity duration-300"
                onClick={() => openLightbox(currentIndex)}
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              <button
                onClick={() => openLightbox(currentIndex)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-cacao rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Ver imagen completa"
              >
                <ZoomIn size={20} />
              </button>
            </>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-cacao rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-cacao rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "bg-gold w-4"
                    : "bg-white/60 hover:bg-white"
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 ${
                  idx === currentIndex
                    ? "border-gold"
                    : "border-transparent hover:border-blush/50"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={`${productName} - Miniatura ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              lightboxPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={32} />
          </button>

          <div
            className="relative w-full h-full max-w-4xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].imageUrl}
              alt={`${productName} - Imagen ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              lightboxNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <span className="text-white font-sans text-sm">
              {lightboxIndex + 1} / {images.length}
            </span>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 translate-y-12 flex gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === lightboxIndex
                    ? "bg-gold w-4"
                    : "bg-white/50 hover:bg-white"
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
