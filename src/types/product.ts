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

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "perfumes", label: "Perfumes" },
  { value: "bolsos", label: "Bolsos" },
  { value: "accesorios", label: "Accesorios" },
  { value: "zapatos", label: "Zapatos" },
  { value: "combos", label: "Combos Especiales" },
];
