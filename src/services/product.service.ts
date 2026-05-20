import db from "@/lib/db";
import { ProductInput } from "@/types/product";
import { updateProductEmbedding } from "@/lib/ai";

export async function createProduct(data: ProductInput) {
  // Verificar duplicados de SKU antes de empezar
  const skus = data.variants.map((v) => v.sku);
  const existingVariants = await db.productVariant.findMany({
    where: { sku: { in: skus } },
    select: { sku: true },
  });

  if (existingVariants.length > 0) {
    const duplicateSkus = existingVariants.map((v) => v.sku).join(", ");
    throw new Error(`Los siguientes SKUs ya existen: ${duplicateSkus}`);
  }

  // Verificar duplicado de slug
  const existingProduct = await db.product.findUnique({
    where: { slug: data.slug },
    select: { slug: true },
  });

  if (existingProduct) {
    throw new Error(`Ya existe un producto con el slug: ${data.slug}`);
  }

  const product = await db.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        description: data.description,
        isActive: data.isActive,
        variants: {
          create: data.variants.map((v) => ({
            sku: v.sku,
            attributeName: v.attributeName,
            attributeValue: v.attributeValue,
            price: v.price,
            originalPrice: v.originalPrice,
            stock: v.stock,
          })),
        },
        images: data.images?.length
          ? {
              create: data.images.map((img) => ({
                imageUrl: img.imageUrl,
                position: img.position,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
        images: { orderBy: { position: "asc" } },
      },
    });

    return newProduct;
  });

  // Actualizar embedding para el RAG de forma asíncrona
  updateProductEmbedding(product.id);

  return product;
}

export async function updateProduct(productId: string, data: ProductInput) {
  const product = await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        description: data.description,
        isActive: data.isActive,
      },
    });

    const existingVariants = await tx.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });

    const existingVariantIds = new Set(existingVariants.map((v) => v.id));
    const newVariantIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id));

    const variantIdsInOrders = await tx.orderItem.findMany({
      where: { variantId: { in: Array.from(existingVariantIds) } },
      select: { variantId: true },
      distinct: ["variantId"],
    });
    const protectedVariantIds = new Set(variantIdsInOrders.map((v) => v.variantId));

    const variantsToDelete = Array.from(existingVariantIds).filter(
      (id) => !newVariantIds.has(id) && !protectedVariantIds.has(id)
    );

    if (variantsToDelete.length > 0) {
      await tx.productVariant.deleteMany({
        where: { id: { in: variantsToDelete } },
      });
    }

    for (const v of data.variants) {
      if (v.id && existingVariantIds.has(v.id)) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            sku: v.sku,
            attributeName: v.attributeName,
            attributeValue: v.attributeValue,
            price: v.price,
            originalPrice: v.originalPrice,
            stock: v.stock,
          },
        });
      } else {
        const existingBySku = await tx.productVariant.findFirst({
          where: { sku: v.sku },
        });
        
        if (existingBySku) {
          await tx.productVariant.update({
            where: { id: existingBySku.id },
            data: {
              attributeName: v.attributeName,
              attributeValue: v.attributeValue,
              price: v.price,
              originalPrice: v.originalPrice,
              stock: v.stock,
              productId,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              sku: v.sku,
              attributeName: v.attributeName,
              attributeValue: v.attributeValue,
              price: v.price,
              originalPrice: v.originalPrice,
              stock: v.stock,
              productId,
            },
          });
        }
      }
    }

    const existingImages = await tx.productImage.findMany({
      where: { productId },
      select: { id: true },
    });
    const existingImageIds = new Set(existingImages.map((i) => i.id));
    const newImageIds = new Set(data.images?.filter((img) => img.id).map((img) => img.id) || []);

    const imagesToDelete = Array.from(existingImageIds).filter((id) => !newImageIds.has(id));
    if (imagesToDelete.length > 0) {
      await tx.productImage.deleteMany({ where: { id: { in: imagesToDelete } } });
    }

    if (data.images?.length) {
      for (const img of data.images) {
        if (img.id && existingImageIds.has(img.id)) {
          await tx.productImage.update({
            where: { id: img.id },
            data: { imageUrl: img.imageUrl, position: img.position },
          });
        } else {
          await tx.productImage.create({
            data: { productId, imageUrl: img.imageUrl, position: img.position },
          });
        }
      }
    }

    return tx.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        images: { orderBy: { position: "asc" } },
      },
    });
  });

  // Actualizar embedding para el RAG de forma asíncrona
  if (product) {
    updateProductEmbedding(product.id);
  }

  return product;
}

export async function deleteProduct(productId: string) {
  await db.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId } });
    await tx.productVariant.deleteMany({ where: { productId } });
    await tx.product.delete({ where: { id: productId } });
  });
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  includeInactive?: boolean;
}

export interface ProductListResult {
  products: Awaited<ReturnType<typeof db.product.findMany>>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const { page = 1, limit = 10, search, category, includeInactive = false } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (!includeInactive) {
    where.isActive = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        variants: true,
        images: { orderBy: { position: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(productId: string) {
  return db.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
      images: { orderBy: { position: "asc" } },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: { price: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });
}

export async function getFeaturedProducts(limit = 4) {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      variants: { orderBy: { price: "asc" }, take: 1 },
      images: { orderBy: { position: "asc" }, take: 2 },
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(12, limit * 3), // Fetch extra products to allow variety
  });

  // Shuffle the products array
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}

export async function getAllCategories() {
  const products = await db.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return products.map((p) => p.category);
}

export async function toggleProductStatus(productId: string) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Producto no encontrado");

  const updated = await db.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });

  updateProductEmbedding(productId);
  return updated;
}
