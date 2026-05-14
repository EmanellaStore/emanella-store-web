"use server";
import { Prisma } from "@prisma/client";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from "@/services/product.service";

function serializeProduct(product: unknown): unknown {
  if (product === null || product === undefined) return product;
  
  if (Array.isArray(product)) {
    return product.map(serializeProduct);
  }
  
  if (typeof product === "object") {
    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(product as Record<string, unknown>)) {
      if (value && typeof value === "object" && "toString" in value && !Array.isArray(value)) {
        serialized[key] = String(value);
      } else {
        serialized[key] = serializeProduct(value);
      }
    }
    return serialized;
  }
  
  return product;
}

export async function handleCreateProduct(formData: FormData) {
  try {
    const variants = JSON.parse(formData.get("variants") as string);
    const images = JSON.parse(formData.get("images") as string || "[]");

    const product = await createProduct({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      isActive: formData.get("isActive") === "true",
      variants,
      images,
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalogo");
    return { success: true, product: serializeProduct(product) };
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        return { 
          success: false, 
          error: `Ya existe un registro con este ${target.join(", ")}` 
        };
      }
    }
    return { success: false, error: "Error desconocido al crear el producto" };
  }
}

export async function handleUpdateProduct(productId: string, formData: FormData) {
  try {
    const variants = JSON.parse(formData.get("variants") as string);
    const images = JSON.parse(formData.get("images") as string || "[]");

    const product = await updateProduct(productId, {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      isActive: formData.get("isActive") === "true",
      variants,
      images,
    });

    revalidatePath("/admin/products");
    revalidatePath("/catalogo");
    return { success: true, product: serializeProduct(product) };
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        return { 
          success: false, 
          error: `Ya existe un registro con este ${target.join(", ")}` 
        };
      }
    }
    return { success: false, error: "Error desconocido al actualizar el producto" };
  }
}

export async function handleDeleteProduct(productId: string) {
  try {
    await deleteProduct(productId);
    revalidatePath("/admin/products");
    revalidatePath("/catalogo");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido al eliminar el producto" 
    };
  }
}

export async function handleGetProducts(
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string,
  includeInactive?: boolean
) {
  const result = await getProducts({ page, limit, search, category, includeInactive });
  return {
    ...result,
    products: serializeProduct(result.products),
  };
}
