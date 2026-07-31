// scripts/cargar-cartera-inicial.ts
// Carga la cartera que Steven llevaba en WhatsApp (2026-07-30).
// Los montos van en miles, igual que en las notas: 350 = $350.000.
// Cada ítem intenta enlazarse al catálogo; si no aparece, queda con su
// descripción tal cual y se reporta al final.
// Uso: npx tsx scripts/cargar-cartera-inicial.ts [--dry-run]
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

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
const dryRun = process.argv.includes("--dry-run");
const mil = (n: number) => n * 1000;

interface ItemCarga {
  buscar: string | null; // término para enlazar con el catálogo
  desc: string; // lo que se guarda como descripción
  precio: number; // en miles
  cantidad?: number;
}

interface PersonaCarga {
  nombre: string;
  tipo?: "CREDITO" | "CONTADO";
  items: ItemCarga[];
  abonos?: number[]; // en miles
  notas?: string;
  saldoEsperado: number; // en miles, para validar contra la nota original
}

const CARTERA: PersonaCarga[] = [
  {
    nombre: "Geral",
    items: [
      { buscar: "Erba Pura", desc: "Xerjoff Erba Pura", precio: 350 },
      { buscar: "Bharara", desc: "Bharara King", precio: 180 },
    ],
    abonos: [150],
    saldoEsperado: 380,
  },
  {
    nombre: "Peña vigilante",
    items: [{ buscar: null, desc: "Pendiente de detallar", precio: 270 }],
    abonos: [135],
    notas: "La nota solo registraba abono 135 y saldo 135; falta el detalle de lo que llevó",
    saldoEsperado: 135,
  },
  {
    nombre: "Jessica mocha",
    items: [
      { buscar: "Whipped Pleasure", desc: "Whipped Pleasure", precio: 200 },
      { buscar: "Aerosoles", desc: "Aerosol", precio: 50 },
    ],
    abonos: [200],
    saldoEsperado: 50,
  },
  {
    nombre: "Yoshi",
    items: [{ buscar: "Zanzibar", desc: "Yara Asad Zanzibar Lattafa", precio: 160 }],
    saldoEsperado: 160,
  },
  {
    nombre: "Jhoan",
    items: [{ buscar: "Hawas Fire", desc: "Hawas Fire", precio: 300 }],
    notas: "Nota original: 'Hawas Fire Pisa 300'",
    saldoEsperado: 300,
  },
  {
    nombre: "Junior",
    items: [{ buscar: "Hawas Fire", desc: "Hawas Fire", precio: 160 }],
    saldoEsperado: 160,
  },
  {
    nombre: "Jefe Anderson",
    tipo: "CONTADO",
    items: [
      { buscar: "Hawas Atlantis", desc: "Hawas Atlantis", precio: 150 },
      { buscar: null, desc: "Yara tradicional", precio: 150 },
    ],
    notas: "Pagó 300 de contado por las dos; el reparto 150/150 es estimado",
    saldoEsperado: 0,
  },
  {
    nombre: "Alba",
    items: [
      {
        buscar: null,
        desc: "Sweet Tooth Sabrina + mantequilla + 9 PM elixir + aerosol amarillo",
        precio: 450,
      },
    ],
    abonos: [200],
    notas: "La nota traía el total 450 sin desglosar por producto",
    saldoEsperado: 250,
  },
  {
    nombre: "Stefany",
    items: [{ buscar: "Hawas Ice", desc: "Hawas Ice", precio: 200 }],
    notas: "Faltan 2 splash por valorizar (la nota no traía su precio)",
    saldoEsperado: 200,
  },
  {
    nombre: "Marcela",
    items: [
      { buscar: "Jhon Paul Elixir", desc: "Jhon Paul Elixir", precio: 150 },
      { buscar: "360 Women", desc: "360 Women", precio: 90 },
      // La nota decía "club nuit lion hearth men": es el único Club de Nuit
      // masculino del catálogo. Confirmar con Steven.
      { buscar: "Club de Nuit Intense", desc: "Club de Nuit Intense Armaf Man", precio: 220 },
      { buscar: "Phantom", desc: "Phantom Paco Rabanne", precio: 150 },
    ],
    saldoEsperado: 610,
  },
  {
    nombre: "Yuliana (empleada de Luis)",
    items: [{ buscar: "Yara Elixir", desc: "Yara Elixir", precio: 200 }],
    abonos: [130],
    saldoEsperado: 70,
  },
  {
    nombre: "Sherin",
    items: [
      { buscar: null, desc: "Lattafa Mallow Madness + mantequilla", precio: 170 },
    ],
    notas: "Grupo con abono conjunto de 500 pendiente de repartir",
    saldoEsperado: 170,
  },
  {
    nombre: "Luis",
    items: [{ buscar: "Hawas Ice", desc: "Hawas Ice", precio: 170 }],
    notas: "Grupo con abono conjunto de 500 pendiente de repartir",
    saldoEsperado: 170,
  },
  {
    nombre: "Leidy",
    items: [{ buscar: "Erba Pura", desc: "Xerjoff Erba Pura", precio: 250 }],
    notas: "Grupo con abono conjunto de 500 pendiente de repartir",
    saldoEsperado: 250,
  },
];

const sinCatalogo: string[] = [];
const enlazados: string[] = [];

async function buscarEnCatalogo(termino: string) {
  const palabras = termino.split(/\s+/);
  const producto = await prisma.product.findFirst({
    where: {
      isActive: true,
      AND: palabras.map((p) => ({
        name: { contains: p, mode: "insensitive" as const },
      })),
    },
    include: { variants: { orderBy: { price: "asc" }, take: 1 } },
  });
  return producto;
}

async function main() {
  let totalCartera = 0;

  for (const persona of CARTERA) {
    const itemsResueltos = [];

    for (const item of persona.items) {
      let productId: string | null = null;
      let variantId: string | null = null;
      let descripcion = item.desc;

      if (item.buscar) {
        const p = await buscarEnCatalogo(item.buscar);
        if (p) {
          productId = p.id;
          variantId = p.variants[0]?.id ?? null;
          descripcion = p.name;
          enlazados.push(`${item.desc} → ${p.name}`);
        } else {
          sinCatalogo.push(`${persona.nombre}: ${item.desc}`);
        }
      } else {
        sinCatalogo.push(`${persona.nombre}: ${item.desc}`);
      }

      itemsResueltos.push({
        productId,
        variantId,
        descripcion,
        cantidad: item.cantidad ?? 1,
        precio: mil(item.precio),
      });
    }

    const total = itemsResueltos.reduce((s, i) => s + i.precio * i.cantidad, 0);
    // El contado se salda solo: genera un abono automático por el total.
    const abonado =
      (persona.tipo === "CONTADO" ? total : 0) +
      (persona.abonos ?? []).reduce((s, a) => s + mil(a), 0);
    const saldo = total - abonado;

    const ok = saldo === mil(persona.saldoEsperado);
    console.log(
      `${ok ? "✔" : "✖"} ${persona.nombre.padEnd(28)} total ${(total / 1000)
        .toString()
        .padStart(4)} − abonos ${(abonado / 1000).toString().padStart(4)} = ${(saldo / 1000)
        .toString()
        .padStart(4)} (esperado ${persona.saldoEsperado})`
    );
    totalCartera += saldo;

    if (dryRun) continue;

    const cliente = await prisma.carteraCliente.create({
      data: { nombre: persona.nombre, notas: persona.notas ?? null },
    });

    const venta = await prisma.carteraVenta.create({
      data: {
        clienteId: cliente.id,
        tipo: persona.tipo ?? "CREDITO",
        total,
        notas: persona.notas ?? null,
        createdBy: "Carga inicial",
        items: { create: itemsResueltos },
      },
    });

    if (persona.tipo === "CONTADO") {
      await prisma.carteraAbono.create({
        data: {
          clienteId: cliente.id,
          ventaId: venta.id,
          monto: total,
          metodo: "Efectivo",
          nota: "Pago de contado",
          createdBy: "Carga inicial",
        },
      });
    }

    for (const abono of persona.abonos ?? []) {
      await prisma.carteraAbono.create({
        data: {
          clienteId: cliente.id,
          monto: mil(abono),
          nota: "Abono registrado en WhatsApp",
          createdBy: "Carga inicial",
        },
      });
    }
  }

  console.log(`\nTotal por cobrar: $${(totalCartera).toLocaleString("es-CO")}`);
  console.log(`(sin aplicar el abono grupal de $500.000 de Sherin/Luis/Leidy)\n`);

  if (enlazados.length) {
    console.log(`Enlazados al catálogo (${enlazados.length}):`);
    enlazados.forEach((e) => console.log(`   ${e}`));
  }
  if (sinCatalogo.length) {
    console.log(`\nSin producto en el catálogo (${sinCatalogo.length}):`);
    sinCatalogo.forEach((s) => console.log(`   ${s}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
