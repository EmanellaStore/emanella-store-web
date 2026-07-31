// scripts/ajustes-cartera-2026-07-30.ts
// Ajustes pedidos por Steven tras revisar la carga inicial:
//  1. Sherin + Luis + Leidy se consolidan en una sola cuenta: "Luis Chicoral",
//     y se aplica el abono conjunto de $500.000.
//  2. Stefany: los 2 splash fueron regalo (se corrige la nota).
//  3. Marcela: "lion hearth men" es el producto nuevo que está como borrador en
//     Shopify → se crea en Neon y se enlaza.
//  4. Jefe Anderson: la "Yara tradicional" es Yara Rosada.
//  5. Todas las ventas a crédito quedan con fecha de pago a dos quincenas.
// Uso: npx tsx scripts/ajustes-cartera-2026-07-30.ts
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { fechaPagoSugerida } from "../src/lib/cartera";

for (const file of [".env.local", ".env"]) {
  const p = resolve(process.cwd(), file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const prisma = new PrismaClient();

async function main() {
  // ── 1. Producto nuevo: Club de Nuit Lion Heart Man (borrador en Shopify) ──
  let lionHeart = await prisma.product.findFirst({
    where: { name: { contains: "Lion Heart", mode: "insensitive" } },
    include: { variants: true },
  });

  if (!lionHeart) {
    lionHeart = await prisma.product.create({
      data: {
        name: "Club de Nuit Lion Heart Man Armaf",
        slug: "club-de-nuit-lion-heart-man-armaf",
        category: "perfumes",
        description:
          "Apertura cítrica y especiada sobre un fondo amaderado y ambarado. Presencia y elegancia con el sello Club de Nuit.",
        isActive: false, // borrador, igual que en Shopify
        genero: "hombre",
        familia: "Amaderado ambarado",
        concentracion: "EDP",
        variants: {
          create: {
            sku: "CDLH-100-01",
            attributeName: "Tamaño",
            attributeValue: "100ml",
            price: 220000,
            stock: 0,
          },
        },
      },
      include: { variants: true },
    });
    console.log("✔ Producto creado en Neon (borrador): " + lionHeart.name);
  } else {
    console.log("· El producto Lion Heart ya existía: " + lionHeart.name);
  }

  // Enlazar el ítem de Marcela
  const itemMarcela = await prisma.carteraVentaItem.findFirst({
    where: { descripcion: { contains: "Club de Nuit Intense" } },
    include: { venta: { include: { cliente: true } } },
  });
  if (itemMarcela && itemMarcela.venta.cliente.nombre === "Marcela") {
    await prisma.carteraVentaItem.update({
      where: { id: itemMarcela.id },
      data: {
        productId: lionHeart.id,
        variantId: lionHeart.variants[0]?.id ?? null,
        descripcion: lionHeart.name,
      },
    });
    console.log("✔ Marcela: ítem corregido → " + lionHeart.name);
  }

  // ── 2. Jefe Anderson: la Yara tradicional es Yara Rosada ──
  const yaraRosada = await prisma.product.findFirst({
    where: { name: { contains: "Yara Rosada", mode: "insensitive" } },
    include: { variants: { orderBy: { price: "asc" }, take: 1 } },
  });
  const itemAnderson = await prisma.carteraVentaItem.findFirst({
    where: { descripcion: "Yara tradicional" },
  });
  if (yaraRosada && itemAnderson) {
    await prisma.carteraVentaItem.update({
      where: { id: itemAnderson.id },
      data: {
        productId: yaraRosada.id,
        variantId: yaraRosada.variants[0]?.id ?? null,
        descripcion: yaraRosada.name,
      },
    });
    console.log("✔ Jefe Anderson: ítem corregido → " + yaraRosada.name);
  }

  // ── 3. Stefany: los splash fueron regalo ──
  const stefany = await prisma.carteraCliente.findFirst({ where: { nombre: "Stefany" } });
  if (stefany) {
    const nota = "Los 2 splash fueron de regalo (no se cobran)";
    await prisma.carteraCliente.update({ where: { id: stefany.id }, data: { notas: nota } });
    await prisma.carteraVenta.updateMany({ where: { clienteId: stefany.id }, data: { notas: nota } });
    console.log("✔ Stefany: nota actualizada (splash de regalo)");
  }

  // ── 4. Consolidar Sherin + Luis + Leidy en "Luis Chicoral" ──
  const delGrupo = ["Sherin", "Luis", "Leidy"];
  const clientesGrupo = await prisma.carteraCliente.findMany({
    where: { nombre: { in: delGrupo } },
    include: { ventas: { include: { items: true } } },
  });

  if (clientesGrupo.length === 3) {
    const itemsConsolidados = clientesGrupo.flatMap((c) =>
      c.ventas.flatMap((v) =>
        v.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          descripcion: `${i.descripcion} (${c.nombre})`,
          cantidad: i.cantidad,
          precio: i.precio,
        }))
      )
    );
    const total = itemsConsolidados.reduce(
      (s, i) => s + Number(i.precio) * i.cantidad,
      0
    );

    const chicoral = await prisma.carteraCliente.create({
      data: {
        nombre: "Luis Chicoral",
        notas: "Cuenta conjunta: incluye lo de Sherin, Luis y Leidy",
      },
    });

    await prisma.carteraVenta.create({
      data: {
        clienteId: chicoral.id,
        tipo: "CREDITO",
        total,
        notas: "Cuenta conjunta (Sherin, Luis y Leidy)",
        createdBy: "Carga inicial",
        items: { create: itemsConsolidados },
      },
    });

    await prisma.carteraAbono.create({
      data: {
        clienteId: chicoral.id,
        monto: 500000,
        nota: "Abono conjunto registrado en WhatsApp",
        createdBy: "Carga inicial",
      },
    });

    await prisma.carteraCliente.deleteMany({
      where: { id: { in: clientesGrupo.map((c) => c.id) } },
    });

    console.log(
      `✔ Consolidado en "Luis Chicoral": total ${total / 1000} − abono 500 = ${
        (total - 500000) / 1000
      }`
    );
  } else {
    console.log("· El grupo ya estaba consolidado");
  }

  // ── 5. Fecha de pago a dos quincenas en todas las ventas a crédito ──
  const fechaPago = fechaPagoSugerida(new Date(), 2);
  const actualizadas = await prisma.carteraVenta.updateMany({
    where: { tipo: "CREDITO", anulada: false },
    data: { fechaPago },
  });
  console.log(
    `✔ Fecha de pago (${fechaPago.toLocaleDateString("es-CO")}) aplicada a ${
      actualizadas.count
    } ventas`
  );

  // ── Resumen ──
  const clientes = await prisma.carteraCliente.findMany({
    include: { ventas: true, abonos: true },
  });
  let totalCartera = 0;
  console.log("\n=== Cartera al día ===");
  for (const c of clientes) {
    const ventas = c.ventas.filter((v) => !v.anulada).reduce((s, v) => s + Number(v.total), 0);
    const abonos = c.abonos.reduce((s, a) => s + Number(a.monto), 0);
    const saldo = ventas - abonos;
    totalCartera += saldo;
    if (saldo > 0) console.log(`   ${c.nombre.padEnd(30)} $${saldo.toLocaleString("es-CO")}`);
  }
  console.log(`\n   TOTAL POR COBRAR: $${totalCartera.toLocaleString("es-CO")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
