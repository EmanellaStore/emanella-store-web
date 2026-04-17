import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.whatsappMessage.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Datos existentes eliminados");

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@emanella.com",
      password: await hashPassword("admin123"),
      name: "Emanella",
      lastName: "Admin",
      phone: "3001234567",
      role: UserRole.ADMIN,
    },
  });

  await prisma.customer.create({
    data: {
      name: "Emanella Admin",
      phone: "3001234567",
      userId: adminUser.id,
    },
  });

  console.log("👤 Usuario admin creado: admin@emanella.com / admin123");

  const demoUsers = [
    { email: "cliente1@email.com", name: "María", lastName: "García", phone: "3002345678", password: "cliente123" },
    { email: "cliente2@email.com", name: "Carlos", lastName: "López", phone: "3003456789", password: "cliente123" },
  ];

  for (const userData of demoUsers) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: await hashPassword(userData.password),
        name: userData.name,
        lastName: userData.lastName,
        phone: userData.phone,
        role: UserRole.CLIENT,
      },
    });

    await prisma.customer.create({
      data: {
        name: `${userData.name} ${userData.lastName}`,
        phone: userData.phone,
        userId: user.id,
      },
    });
  }

  console.log("👥 Usuarios demo creados:");
  console.log("   cliente1@email.com / cliente123");
  console.log("   cliente2@email.com / cliente123");

  const products = [
    {
      name: "Midnight Velvet",
      slug: "midnight-velvet",
      description: "Una fragancia intensa y sensual con notas cálidas y elegantes para ocasiones especiales.",
      category: "perfumes",
      variants: [
        { sku: "MV-50", attributeName: "Tamaño", attributeValue: "50ml", price: "189000.00", stock: 10 },
        { sku: "MV-100", attributeName: "Tamaño", attributeValue: "100ml", price: "289000.00", stock: 6 },
      ],
    },
    {
      name: "Ethereal Bloom",
      slug: "ethereal-bloom",
      description: "Perfume floral y fresco con un perfil femenino, suave y sofisticado.",
      category: "perfumes",
      variants: [
        { sku: "EB-50", attributeName: "Tamaño", attributeValue: "50ml", price: "165000.00", stock: 12 },
        { sku: "EB-100", attributeName: "Tamaño", attributeValue: "100ml", price: "245000.00", stock: 8 },
      ],
    },
    {
      name: "Golden Amber",
      slug: "golden-amber",
      description: "Fragancia oriental con carácter, ideal para quienes buscan presencia y duración.",
      category: "perfumes",
      variants: [
        { sku: "GA-50", attributeName: "Tamaño", attributeValue: "50ml", price: "210000.00", stock: 9 },
        { sku: "GA-100", attributeName: "Tamaño", attributeValue: "100ml", price: "320000.00", stock: 5 },
      ],
    },
    {
      name: "Sienna Tote",
      slug: "sienna-tote",
      description: "Bolso elegante de uso diario con diseño sobrio y espacioso.",
      category: "bolsos",
      variants: [
        { sku: "ST-UNICO", attributeName: "Presentación", attributeValue: "Único", price: "350000.00", stock: 4 },
      ],
    },
    {
      name: "Pearl Clutch",
      slug: "pearl-clutch",
      description: "Clutch refinado para eventos y ocasiones especiales.",
      category: "bolsos",
      variants: [
        { sku: "PC-UNICO", attributeName: "Presentación", attributeValue: "Único", price: "220000.00", stock: 7 },
      ],
    },
    {
      name: "Golden Hour Set",
      slug: "golden-hour-set",
      description: "Set de accesorios con acabado dorado para complementar looks elegantes.",
      category: "accesorios",
      variants: [
        { sku: "GHS-UNICO", attributeName: "Presentación", attributeValue: "Único", price: "120000.00", stock: 15 },
      ],
    },
    {
      name: "Silk Scarf",
      slug: "silk-scarf",
      description: "Pañuelo liviano y sofisticado para elevar cualquier outfit.",
      category: "accesorios",
      variants: [
        { sku: "SS-UNICO", attributeName: "Presentación", attributeValue: "Único", price: "85000.00", stock: 20 },
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
        isActive: true,
        variants: {
          create: product.variants,
        },
      },
    });
  }

  console.log(`✅ Seed completado:`);
  console.log(`   - 1 usuario admin`);
  console.log(`   - ${demoUsers.length} usuarios demo (cliente)`);
  console.log(`   - ${products.length} productos`);
}

main()
  .catch((error) => {
    console.error("❌ Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
