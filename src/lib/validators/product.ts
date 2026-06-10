import { z } from "zod";

const MAX_IMAGES = 4;

export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU requerido"),
  attributeName: z.string().min(1, "Nombre del atributo requerido"),
  attributeValue: z.string().min(1, "Valor del atributo requerido"),
  price: z.number().min(0.01, "Precio debe ser mayor a 0"),
  originalPrice: z.number().min(0.01, "Precio original debe ser mayor a 0").nullable().optional(),
  stock: z.number().int().min(0, "Stock no puede ser negativo").default(0),
});

export const ProductImageSchema = z.object({
  imageUrl: z.string().url("URL de imagen inválida"),
  position: z.number().int().min(0).max(MAX_IMAGES - 1),
});

export const ProductSchema = z.object({
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  slug: z.string().min(3, "Slug debe tener al menos 3 caracteres").regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug debe contener solo letras minúsculas, números y guiones"
  ),
  category: z.enum(["perfumes", "bolsos", "accesorios", "zapatos", "combos"]),
  description: z.string().min(10, "Descripción debe tener al menos 10 caracteres"),
  isActive: z.boolean().default(true),
  variants: z.array(ProductVariantSchema).min(1, "Al menos 1 variante requerida"),
  images: z.array(ProductImageSchema).max(MAX_IMAGES).optional(),
});

export type ProductFormData = z.infer<typeof ProductSchema>;
export type ProductVariantFormData = z.infer<typeof ProductVariantSchema>;

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateSku(productName: string, attributeValue: string, index: number): string {
  // 1. Prefijo del nombre: iniciales si hay varias palabras, sino primeras 3-4 letras
  const cleanName = productName.trim();
  let namePart = "";
  
  if (!cleanName) {
    namePart = "SKU";
  } else {
    const words = cleanName.split(/\s+/);
    if (words.length >= 2) {
      // Tomar la primera letra de cada palabra
      namePart = words
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4);
    } else {
      // Tomar las primeras 3-4 letras
      namePart = cleanName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4);
    }
  }

  // Asegurar que tenga al menos 3 caracteres
  namePart = namePart.padEnd(3, "X");

  // 2. Parte del atributo (ej: 100M)
  const valuePart = attributeValue
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(1, "0"); // Al menos un caracter

  // 3. Índice para evitar duplicados en el mismo producto
  const num = String(index + 1).padStart(2, "0");

  return `${namePart}-${valuePart}-${num}`;
}
