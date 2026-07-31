// scripts/import-perfume-data.ts
// Importa el perfil olfativo (metafields perfume.* de Shopify, snapshot en
// shopify-perfume-data.json) a los productos de Neon.
// Cruce: slug de Neon === handle de Shopify; fallback por nombre normalizado.
// Solo escribe campos de perfume; no toca nombre/precio/imágenes.
// Uso: npx tsx scripts/import-perfume-data.ts [--dry-run]
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

// Carga .env manualmente (tsx no lo hace)
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

interface PerfumeRecord {
  handle: string;
  title: string;
  genero: string;
  concentracion: string;
  familia: string;
  duracion: string;
  notasSalida: string;
  notasCorazon: string;
  notasFondo: string;
  inspiradoEn?: string;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function main() {
  const data: PerfumeRecord[] = JSON.parse(
    readFileSync(resolve(process.cwd(), "scripts/shopify-perfume-data.json"), "utf8")
  );
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, category: true },
  });

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const byName = new Map(products.map((p) => [normalize(p.name), p]));

  let updated = 0;
  const unmatchedShopify: string[] = [];
  const matchedIds = new Set<string>();

  for (const rec of data) {
    const product =
      bySlug.get(rec.handle) ??
      bySlug.get(`${rec.handle}-`) ?? // slugs de Neon con guion final accidental
      byName.get(normalize(rec.title)) ??
      null;
    if (!product) {
      unmatchedShopify.push(`${rec.title} (${rec.handle})`);
      continue;
    }
    matchedIds.add(product.id);
    if (dryRun) {
      console.log(`[dry-run] ${product.name} <- ${rec.handle}`);
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: {
        notasSalida: rec.notasSalida || null,
        notasCorazon: rec.notasCorazon || null,
        notasFondo: rec.notasFondo || null,
        concentracion: rec.concentracion || null,
        familia: rec.familia || null,
        duracion: rec.duracion || null,
        inspiradoEn: rec.inspiradoEn || null,
        genero: rec.genero || null,
      },
    });
    updated++;
  }

  const unmatchedNeon = products.filter((p) => !matchedIds.has(p.id));

  console.log(`\n== Importación de perfil olfativo ==`);
  console.log(`Registros Shopify: ${data.length}`);
  console.log(`Productos Neon:    ${products.length}`);
  console.log(`Actualizados:      ${dryRun ? "(dry-run)" : updated}`);
  if (unmatchedShopify.length) {
    console.log(`\nShopify sin match en Neon (${unmatchedShopify.length}):`);
    unmatchedShopify.forEach((s) => console.log(`  - ${s}`));
  }
  if (unmatchedNeon.length) {
    console.log(`\nNeon sin datos de Shopify (${unmatchedNeon.length}):`);
    unmatchedNeon.forEach((p) => console.log(`  - ${p.name} [${p.category}] (${p.slug})`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
