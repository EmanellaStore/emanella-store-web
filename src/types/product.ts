export interface ProductVariantInput {
  id?: string;
  sku: string;
  attributeName: string;
  attributeValue: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
}

export interface ProductImageInput {
  id?: string;
  imageUrl: string;
  position: number;
}

export interface ProductInput {
  name: string;
  slug: string;
  category: string;
  description: string;
  isActive: boolean;
  variants: ProductVariantInput[];
  images?: ProductImageInput[];
  // Perfil olfativo (opcional; solo aplica a perfumes)
  notasSalida?: string | null;
  notasCorazon?: string | null;
  notasFondo?: string | null;
  concentracion?: string | null;
  familia?: string | null;
  duracion?: string | null;
  inspiradoEn?: string | null;
  genero?: string | null;
}

export interface ProductOutput {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  isActive: boolean;
  variants: ProductVariantOutput[];
  images: ProductImageOutput[];
}

export interface ProductVariantOutput {
  id: string;
  sku: string;
  attributeName: string;
  attributeValue: string;
  price: number;
  originalPrice: number | null;
  stock: number;
}

export interface ProductImageOutput {
  id: string;
  imageUrl: string;
  position: number;
}

export type Category = "perfumes" | "bolsos" | "accesorios" | "zapatos" | "combos";

// Por ahora la tienda es solo perfumería; las demás categorías se reactivarán
// más adelante (decisión de Steven 2026-07-09). El validador sigue aceptando
// los valores viejos para no romper productos existentes.
export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "perfumes", label: "Perfumes" },
  // { value: "bolsos", label: "Bolsos" },
  // { value: "accesorios", label: "Accesorios" },
  // { value: "zapatos", label: "Zapatos" },
  { value: "combos", label: "Combos Especiales" },
];
