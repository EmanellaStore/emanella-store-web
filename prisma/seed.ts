import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    {
      name: "Midnight Velvet",
      slug: "midnight-velvet",
      description: "Una fragancia intensa y sensual con notas cálidas y elegantes para ocasiones especiales.",
      category: "perfumes",
      imageUrl: "",
      isActive: true,
      variants: [
        {
          sku: "MV-50",
          attributeName: "Tamaño",
          attributeValue: "50ml",
          price: "189000.00",
          stock: 10,
        },
        {
          sku: "MV-100",
          attributeName: "Tamaño",
          attributeValue: "100ml",
          price: "289000.00",
          stock: 6,
        },
      ],
    },
    {
      name: "Ethereal Bloom",
      slug: "ethereal-bloom",
      description: "Perfume floral y fresco con un perfil femenino, suave y sofisticado.",
      category: "perfumes",
      imageUrl: "",
      isActive: true,
      variants: [
        {
          sku: "EB-50",
          attributeName: "Tamaño",
          attributeValue: "50ml",
          price: "165000.00",
          stock: 12,
        },
        {
          sku: "EB-100",
          attributeName: "Tamaño",
          attributeValue: "100ml",
          price: "245000.00",
          stock: 8,
        },
      ],
    },
    {
      name: "Golden Amber",
      slug: "golden-amber",
      description: "Fragancia oriental con carácter, ideal para quienes buscan presencia y duración.",
      category: "perfumes",
      imageUrl: "",
      isActive: true,
      variants: [
        {
          sku: "GA-50",
          attributeName: "Tamaño",
          attributeValue: "50ml",
          price: "210000.00",
          stock: 9,
        },
        {
          sku: "GA-100",
          attributeName: "Tamaño",
          attributeValue: "100ml",
          price: "320000.00",
          stock: 5,
        },
      ],
    },
    {
      name: "Sienna Tote",
      slug: "sienna-tote",
      description: "Bolso elegante de uso diario con diseño sobrio y espacioso.",
      category: "bolsos",
      imageUrl: "",
      isActive: true,
      variants: [
        {
          sku: "ST-UNICO",
          attributeName: "Presentación",
          attributeValue: "Único",
          price: "350000.00",
          stock: 4,
        },
      ],
    },
    {
      name: "Pearl Clutch",
      slug: "pearl-clutch",
      description: "Clutch refinado para eventos y ocasiones especiales.",
      category: "bolsos",
      imageUrl: "",
      isActive: true,
      variants: [
        {
          sku: "PC-UNICO",
          attributeName: "Presentación",
          attributeValue: "Único",
          price: "220000.00",
          stock: 7,
        },
      ],
    },
    {
      name: "Golden Hour Set",
      slug: "golden-hour-set",
      description: "Set de accesorios con acabado dorado para complementar looks elegantes.",
      category: "accesorios",
      imageUrl: "",
      isActive: true,
      variants: [
        {
          sku: "GHS-UNICO",
          attributeName: "Presentación",
          attributeValue: "Único",
          price: "120000.00",
          stock: 15,
        },
      ],
    },
    {
      name: "Silk Scarf",
      slug: "silk-scarf",
      description: "Pañuelo liviano y sofisticado para elevar cualquier outfit.",
      category: "accesorios",
      imageUrl: "",
      isActive: true,
      variants: [
        {
          sku: "SS-UNICO",
          attributeName: "Presentación",
          attributeValue: "Único",
          price: "85000.00",
          stock: 20,
        },
      ],
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        variants: {
          create: product.variants,
        },
      },
    });
  }

  console.log(`✅ Seed completado: ${products.length} productos creados`);
}

main()
  .catch((error) => {
    console.error("❌ Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });