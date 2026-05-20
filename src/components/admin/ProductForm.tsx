"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { CATEGORIES } from "@/types/product";
import { generateSlug, generateSku } from "@/lib/validators/product";

interface Variant {
  sku: string;
  attributeName: string;
  attributeValue: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  description: string | null;
  isActive: boolean;
  variants: Variant[];
  images: { imageUrl: string; position: number }[];
}

interface ProductFormProps {
  product?: {
    name?: string;
    slug?: string;
    category?: string;
    description?: string | null;
    isActive?: boolean;
    variants?: { sku: string; attributeName: string; attributeValue: string; price: number | string; originalPrice?: number | string | null; stock: number }[];
    images?: { imageUrl: string; position: number }[];
  };
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    slug: product?.slug || "",
    category: product?.category || "perfumes",
    description: product?.description || "",
    isActive: product?.isActive ?? true,
    variants: (product?.variants || [{ sku: "", attributeName: "Tamaño", attributeValue: "", price: 0, originalPrice: null, stock: 0 }]).map((v) => ({
      ...v,
      price: typeof v.price === "string" ? parseFloat(v.price) || 0 : v.price,
      originalPrice: v.originalPrice !== undefined && v.originalPrice !== null
        ? (typeof v.originalPrice === "string" ? parseFloat(v.originalPrice) || null : v.originalPrice)
        : null,
    })),
    images: product?.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (!product && formData.name && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, formData.slug, product]);

  const handleNameChange = (name: string) => {
    const slug = product ? formData.slug : generateSlug(name);
    setFormData((prev) => ({
      ...prev,
      name,
      slug,
      variants: prev.variants.map((v, i) => ({
        ...v,
        sku: generateSku(name, v.attributeValue || "NEW", i),
      })),
    }));
  };

  const handleVariantChange = (index: number, field: string, value: string | number | null) => {
    setFormData((prev) => {
      const newVariants = prev.variants.map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, [field]: value };
        if (field === "attributeValue") {
          updated.sku = generateSku(formData.name, String(value), index);
        }
        return updated;
      });
      return { ...prev, variants: newVariants };
    });
  };

  const addVariant = () => {
    setFormData((prev) => {
      const newIndex = prev.variants.length;
      const newSku = generateSku(prev.name, "NEW", newIndex);
      return {
        ...prev,
        variants: [
          ...prev.variants,
          { sku: newSku, attributeName: "Tamaño", attributeValue: "", price: 0, originalPrice: null, stock: 0 },
        ],
      };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    if (!newImageUrl.startsWith("http")) {
      setErrors((prev) => ({ ...prev, imageUrl: "URL debe comenzar con http:// o https://" }));
      return;
    }
    if (formData.images.length >= 4) {
      setErrors((prev) => ({ ...prev, imageUrl: "Máximo 4 imágenes permitidas" }));
      return;
    }

    const position = formData.images.length;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { imageUrl: newImageUrl.trim(), position }],
    }));
    setNewImageUrl("");
    setErrors((prev) => ({ ...prev, imageUrl: "" }));
  };

  const removeImage = (position: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images
        .filter((img) => img.position !== position)
        .map((img, idx) => ({ ...img, position: idx })),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nombre requerido";
    if (!formData.slug.trim()) newErrors.slug = "Slug requerido";
    if (!formData.description?.trim()) newErrors.description = "Descripción requerida";
    if (!formData.category) newErrors.category = "Categoría requerida";

    formData.variants.forEach((v, i) => {
      if (!v.sku.trim()) newErrors[`variant_${i}_sku`] = "SKU requerido";
      if (!v.attributeValue.trim()) newErrors[`variant_${i}_value`] = "Valor requerido";
      const priceNum = typeof v.price === "string" ? parseFloat(v.price) : v.price;
      if (priceNum <= 0) newErrors[`variant_${i}_price`] = "Precio debe ser mayor a 0";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const submitData = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        description: formData.description,
        isActive: formData.isActive,
        variants: formData.variants.map((v) => ({
          sku: v.sku,
          attributeName: v.attributeName,
          attributeValue: v.attributeValue,
          price: typeof v.price === "string" ? parseFloat(v.price) : v.price,
          originalPrice: v.originalPrice !== undefined && v.originalPrice !== null && String(v.originalPrice).trim() !== ""
            ? (typeof v.originalPrice === "string" ? parseFloat(v.originalPrice) || null : v.originalPrice)
            : null,
          stock: v.stock,
        })),
        images: formData.images,
      };
      await onSubmit(submitData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-warm-gray mb-2">
            Nombre del Producto
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full border p-3 outline-none focus:border-gold ${errors.name ? "border-red-500" : "border-blush/50"} bg-white/50`}
            placeholder="Ej: Midnight Velvet"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-warm-gray mb-2">
            Slug (URL)
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
            className={`w-full border p-3 outline-none focus:border-gold ${errors.slug ? "border-red-500" : "border-blush/50"} bg-white/50`}
            placeholder="ej: midnight-velvet"
          />
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-warm-gray mb-2">
            Categoría
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className={`w-full border p-3 outline-none focus:border-gold ${errors.category ? "border-red-500" : "border-blush/50"} bg-white/50`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 accent-gold"
            />
            <span className="text-xs uppercase tracking-widest text-warm-gray">
              Producto Activo
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-warm-gray mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          className={`w-full border p-3 outline-none focus:border-gold ${errors.description ? "border-red-500" : "border-blush/50"} bg-white/50`}
          placeholder="Describe el producto..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-xs uppercase tracking-widest text-warm-gray">
            Imágenes (máx. 4)
          </label>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className={`flex-1 border p-3 outline-none focus:border-gold ${errors.imageUrl ? "border-red-500" : "border-blush/50"} bg-white/50`}
          />
          <button
            type="button"
            onClick={addImageUrl}
            disabled={formData.images.length >= 4}
            className="px-4 py-3 bg-cacao text-cream text-xs uppercase tracking-widest hover:bg-gold disabled:bg-warm-gray transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        {errors.imageUrl && <p className="text-red-500 text-xs mb-2">{errors.imageUrl}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((img, index) => (
            <div key={img.position} className="relative group">
              <div className="aspect-square bg-blush/10 border border-blush/30 overflow-hidden">
                <img
                  src={img.imageUrl}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23E8C4B8' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%238C7B6B' font-size='12'%3EError%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <span className="bg-cacao/80 text-cream text-[10px] px-2 py-1">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(img.position)}
                  className="bg-red-500 text-white p-1 hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {formData.images.length === 0 && (
            <div className="aspect-square bg-blush/10 border border-dashed border-blush/30 flex items-center justify-center">
              <div className="text-center text-warm-gray">
                <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">Sin imágenes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-xs uppercase tracking-widest text-warm-gray">
            Variantes ({formData.variants.length})
          </label>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 border border-cacao text-cacao text-xs uppercase tracking-widest hover:bg-cacao hover:text-cream transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            Agregar Variante
          </button>
        </div>

        <div className="space-y-4">
          {formData.variants.map((variant, index) => (
            <div key={index} className="bg-white/30 border border-blush/20 p-4">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">
                  Variante {index + 1}
                </span>
                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-gray mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                    className={`w-full border p-2 outline-none focus:border-gold text-sm ${errors[`variant_${index}_sku`] ? "border-red-500" : "border-blush/50"} bg-white/50`}
                    placeholder="MV-50"
                  />
                  {errors[`variant_${index}_sku`] && (
                    <p className="text-red-500 text-[10px] mt-1">{errors[`variant_${index}_sku`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-gray mb-1">
                    Atributo
                  </label>
                  <input
                    type="text"
                    value={variant.attributeName}
                    onChange={(e) => handleVariantChange(index, "attributeName", e.target.value)}
                    className="w-full border border-blush/50 p-2 outline-none focus:border-gold text-sm bg-white/50"
                    placeholder="Tamaño"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-gray mb-1">
                    Valor
                  </label>
                  <input
                    type="text"
                    value={variant.attributeValue}
                    onChange={(e) => handleVariantChange(index, "attributeValue", e.target.value)}
                    className={`w-full border p-2 outline-none focus:border-gold text-sm ${errors[`variant_${index}_value`] ? "border-red-500" : "border-blush/50"} bg-white/50`}
                    placeholder="50ml"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-gray mb-1">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    value={variant.price || ""}
                    onChange={(e) => handleVariantChange(index, "price", parseFloat(e.target.value) || 0)}
                    className={`w-full border p-2 outline-none focus:border-gold text-sm ${errors[`variant_${index}_price`] ? "border-red-500" : "border-blush/50"} bg-white/50`}
                    placeholder="189000"
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-gray mb-1">
                    Precio Orig. (Opt)
                  </label>
                  <input
                    type="number"
                    value={variant.originalPrice || ""}
                    onChange={(e) => handleVariantChange(index, "originalPrice", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border border-blush/50 p-2 outline-none focus:border-gold text-sm bg-white/50"
                    placeholder="239000"
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-gray mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, "stock", parseInt(e.target.value) || 0)}
                    className="w-full border border-blush/50 p-2 outline-none focus:border-gold text-sm bg-white/50"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-blush/20">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-warm-gray text-warm-gray text-xs uppercase tracking-widest hover:border-cacao hover:text-cacao transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-gold text-cream text-xs uppercase tracking-widest hover:bg-gold-dark transition-colors disabled:bg-warm-gray flex items-center gap-2"
        >
          {submitting ? (
            <>
              <span className="animate-spin">⟳</span>
              Guardando...
            </>
          ) : (
            <>
              <Upload size={14} />
              {product ? "Actualizar" : "Crear"} Producto
            </>
          )}
        </button>
      </div>
    </form>
  );
}
