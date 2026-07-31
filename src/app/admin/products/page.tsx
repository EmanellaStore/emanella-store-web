//src/app/admin/products/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { CATEGORIES } from "@/types/product";
import { handleCreateProduct, handleUpdateProduct, handleDeleteProduct, handleGetProducts } from "./actions";
import { useToastStore } from "@/store/useToastStore";

interface ProductVariant {
  id: string;
  sku: string;
  attributeName: string;
  attributeValue: string;
  price: string;
  stock: number;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  position: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  isActive: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInactive, setShowInactive] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.showToast);
  const [, startTransition] = useTransition();

  const limit = 10;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await handleGetProducts(
        page,
        limit,
        search || undefined,
        categoryFilter || undefined,
        showInactive
      );
      setProducts(result.products as unknown as Product[]);
      setTotalPages(result.pagination.pages);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      loadProducts();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, categoryFilter, showInactive]);

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    setDeletingId(productId);
    try {
      const result = await handleDeleteProduct(productId);
      if (result && !result.success) {
        showToast({ title: "Error", description: result.error || "Error al eliminar el producto" });
      } else {
        showToast({ title: "Eliminado", description: "Producto eliminado correctamente" });
        await loadProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast({ title: "Error", description: "Error inesperado al eliminar el producto" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    category: string;
    description: string | null;
    isActive: boolean;
    variants: { sku: string; attributeName: string; attributeValue: string; price: number; stock: number }[];
    images: { imageUrl: string; position: number }[];
  }) => {
    try {
      const formData = new FormData();
      formData.set("name", data.name);
      formData.set("slug", data.slug);
      formData.set("category", data.category);
      formData.set("description", data.description || "");
      formData.set("isActive", String(data.isActive));
      formData.set("variants", JSON.stringify(data.variants));
      formData.set("images", JSON.stringify(data.images));

      let result;
      if (editingProduct) {
        result = await handleUpdateProduct(editingProduct.id, formData);
      } else {
        result = await handleCreateProduct(formData);
      }

      if (result && !result.success) {
        showToast({ title: "Error", description: result.error || "Error al guardar el producto" });
        return;
      }

      showToast({ 
        title: editingProduct ? "Actualizado" : "Creado", 
        description: `Producto ${editingProduct ? "actualizado" : "creado"} correctamente` 
      });
      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      showToast({ title: "Error", description: "Error inesperado al guardar el producto" });
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl text-cacao">Productos</h1>
            <p className="font-sans text-xs text-warm-gray mt-1">
              {products.length} productos{loading && " (cargando...)"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/catalogo"
              className="font-sans text-xs text-gold hover:underline tracking-widest uppercase"
            >
              Ver Tienda →
            </Link>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-warm-black text-on-dark text-xs uppercase tracking-widest hover:bg-gold-dark transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Nuevo Producto
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar productos..."
              className="w-full border border-blush/50 bg-beige pl-10 pr-4 py-3 text-sm text-cacao outline-none focus:border-gold"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="border border-blush/50 bg-beige px-4 py-3 text-sm text-cacao outline-none focus:border-gold"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-4 py-3 border border-blush/50 bg-beige cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setPage(1);
              }}
              className="accent-gold"
            />
            <span className="text-sm text-cacao">Mostrar inactivos</span>
          </label>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-cream w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-cream border-b border-blush/30 p-4 flex items-center justify-between">
                <h2 className="font-serif text-2xl text-cacao">
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="p-2 hover:bg-blush/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <ProductForm
                  product={editingProduct || undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-beige border border-blush/20 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cacao text-cream text-[10px] uppercase tracking-widest">
                <th className="p-4">Imagen</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-warm-gray">
                    Cargando...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-warm-gray">
                    No hay productos{search && ` para "${search}"`}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b border-blush/10 hover:bg-cream/40 transition-colors text-sm ${!product.isActive ? "opacity-60" : ""}`}
                  >
                    <td className="p-4">
                      <div className="relative w-16 h-16 bg-blush/10 overflow-hidden">
                        {product.images[0]?.imageUrl ? (
                          <Image
                            src={product.images[0].imageUrl}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-warm-gray text-xs">
                            Sin img
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-sans font-bold text-cacao">{product.name}</div>
                      <div className="text-xs text-warm-gray">{product.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs uppercase tracking-widest text-warm-gray">
                        {CATEGORIES.find((c) => c.value === product.category)?.label || product.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-sans text-sm text-cacao">
                        {product.variants.length > 0 ? (
                          <>
                            ${Number(product.variants[0].price).toLocaleString("es-CO")}
                            {product.variants.length > 1 && (
                              <span className="text-xs text-warm-gray ml-1">
                                - ${Number(product.variants[product.variants.length - 1].price).toLocaleString("es-CO")}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-warm-gray">Sin precio</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-sans text-sm text-cacao">
                        {product.variants.reduce((sum, v) => sum + v.stock, 0)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded ${
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/producto/${product.slug}`}
                          target="_blank"
                          className="p-2 text-warm-gray hover:text-gold transition-colors"
                          title="Ver en tienda"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-warm-gray hover:text-gold transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 text-warm-gray hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-blush/50 hover:border-gold disabled:opacity-50 disabled:hover:border-blush/50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-warm-gray">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-blush/50 hover:border-gold disabled:opacity-50 disabled:hover:border-blush/50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
