// scripts/sincronizar-shopify.ts
// Sincroniza el catálogo de Neon con Shopify (snapshot 2026-07-31):
//   1. CREA los productos que existen en Shopify pero no en Neon (20 borradores
//      nuevos: Nitro Red, Bharara King/Niche, Lion Heart Women, combos, Cookie
//      Crave, Odyssey varios, etc.). Todos son DRAFT sin precio → entran como
//      inactivos con precio 0 (se completan luego en el admin).
//   2. ACTUALIZA el estado (isActive) de todos los productos existentes según
//      Shopify: activo → visible en la tienda; borrador → oculto pero guardado.
//   3. Limpia el slug "moshino-toy-2-black-" (tenía un guion sobrante).
//
// No toca precios ni stock de los productos existentes (para no pisar la
// gestión de inventario ni precios manuales de Neon, y evitar rarezas de
// Shopify como Mallow Madness a $1.000). No hay productos archivados en Shopify.
//
// Uso: npx tsx scripts/sincronizar-shopify.ts [--dry-run]
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

// Handles ACTIVOS en Shopify (todo lo demás es borrador).
const ACTIVOS = new Set<string>([
  "9-pm-afnan", "aerosoles-lattafa-give-me-gourdman", "art-of-universe-lattafa",
  "billie-eilish", "combo-yara-aerosol", "hawas-atlantis", "hawas-fire",
  "hawas-ice", "hawas-kobra", "hawas-tropical", "island-bliss-armaf",
  "jean-paul-gaultter-divine", "jhon-paul-elixir", "khamrah-lattafa",
  "la-bomba-carolina-herrera", "lacoste-red", "lattafa-berry-on-top",
  "lattafa-choco-overdose", "lattafa-choco-overdose-combo-aerosol",
  "lattafa-mallow-madness", "lataffa-noble-blush", "lataffa-sublime-unisex",
  "lattafa-vanilla-freak", "lattafa-vanilla-freak-combo-aerosol",
  "moshino-toy-2-blank", "moshino-toy-2-black", "moshino-unisex-pearl",
  "nyc-bond-no-9-tribeca", "nyc-greenwich-village", "odyssey-candee-armaf",
  "odyssey-mandarine-sky-armaf", "orientica-oud-saffron", "orientica-rouge",
  "orientica-velvet-gold", "phantom-paco-rabanne", "santal-33",
  "sweet-tooth-sabrina-caramel-dream",
  "sweet-tooth-sabrina-carpenter", "sweet-tooth-sabrina-carpenter-me-espresso",
  "whipped-pleasure", "xerjoff-erba-pura", "asad-burbone", "yara-assad",
  "asad-zanzibar", "yara-candy", "yara-elixir", "yara-moi", "yara-rosada",
  "yara-tous", "yum-yum-armaf",
]);

// Productos que faltan en Neon (borradores nuevos de Shopify, sin precio).
interface Nuevo {
  slug: string; nombre: string; sku: string; genero: string;
  combo?: boolean; desc?: string;
}
const FALTANTES: Nuevo[] = [
  { slug: "9-pm-elixir-afnan", nombre: "9 PM Elixir Afnan", sku: "9PE-100-01", genero: "hombre",
    desc: "La versión concentrada de 9PM: más dulzor especiado, más resinas y una duración notablemente superior. Para la noche." },
  { slug: "ajwad-lattafa", nombre: "Ajwad Lattafa", sku: "AJL-100-01", genero: "unisex",
    desc: "Frutas jugosas y un toque especiado sobre un fondo ambarado y avainillado. Versátil y fácil de llevar todo el día." },
  { slug: "bharara-king", nombre: "Bharara King", sku: "BHK-100-01", genero: "hombre",
    desc: "Naranja, bergamota y limón abriendo a un corazón tutti frutti, con un fondo de almizcle blanco, ámbar y vainilla. Dulce y magnético." },
  { slug: "bharara-niche-femme", nombre: "Bharara Niche Femme", sku: "BNF-100-01", genero: "dama",
    desc: "Frutas en la apertura, rosa turca e incienso al centro, y un fondo de sándalo y vainilla. Femenina, solemne y elegante." },
  { slug: "club-de-nuit-lion-heart-women-armaf", nombre: "Club de Nuit Lion Heart Women Armaf", sku: "CDLW-100-01", genero: "dama",
    desc: "Flores y frutas envueltas en ámbar y maderas suaves. Femenina, sofisticada y de estela persistente." },
  { slug: "combo-cookie-crave-aerosol", nombre: "Combo Cookie Crave + Aerosol", sku: "CCC-100-01", genero: "unisex", combo: true,
    desc: "Cookie Crave con su aerosol corporal a juego: galleta y vainilla cremosa en formato doble." },
  { slug: "combo-whipped-pleasure-aerosol", nombre: "Combo Whipped Pleasure + Aerosol", sku: "CWP-100-01", genero: "unisex", combo: true,
    desc: "Whipped Pleasure con su aerosol corporal a juego. Caramelo salado y crema, con fijación reforzada." },
  { slug: "combo-yara-moi-aerosol", nombre: "Combo Yara Moi + Aerosol", sku: "CYM-100-01", genero: "dama", combo: true,
    desc: "Yara Moi con su aerosol corporal a juego: la dupla limpia y elegante para el día a día." },
  { slug: "combo-yara-rosada-aerosol", nombre: "Combo Yara Rosada + Aerosol", sku: "CYR-100-01", genero: "dama", combo: true,
    desc: "Yara Rosada con su aerosol corporal a juego para fijar el aroma y que dure todo el día." },
  { slug: "cookie-crave-lattafa", nombre: "Cookie Crave Lattafa", sku: "CCL-100-01", genero: "unisex",
    desc: "Galleta recién horneada, azúcar y vainilla cremosa. Un gourmand cálido de la colección Give Me Gourmand." },
  { slug: "fakhar-rose-lattafa", nombre: "Fakhar Rose Lattafa", sku: "FRL-100-01", genero: "dama",
    desc: "Rosa moderna y frutal sobre un fondo suave de vainilla y almizcle. Femenina, pulida y con buena fijación." },
  { slug: "fame-couture-edition-paco-rabanne", nombre: "Fame Couture Edition Paco Rabanne", sku: "FCE-100-01", genero: "dama",
    desc: "Mango y flores blancas con un fondo de incienso y sándalo. Glamour rotundo en una edición de colección." },
  { slug: "jean-paul-gaultier-la-belle", nombre: "Jean Paul Gaultier La Belle", sku: "JPLB-100-01", genero: "dama" },
  { slug: "khamrah-dukhan-lattafa", nombre: "Khamrah Dukhan Lattafa", sku: "KDL-100-01", genero: "unisex" },
  { slug: "nitro-red", nombre: "Nitro Red", sku: "NTR-100-01", genero: "hombre" },
  { slug: "odyssey-limoni-fresh-armaf", nombre: "Odyssey Limoni Fresh Armaf", sku: "OLF-100-01", genero: "unisex" },
  { slug: "odyssey-mega-armaf", nombre: "Odyssey Mega Armaf", sku: "OMG-100-01", genero: "unisex" },
  { slug: "odyssey-spectra-armaf", nombre: "Odyssey Spectra Armaf", sku: "OSP-100-01", genero: "unisex" },
  { slug: "odyssey-wild-one-armaf", nombre: "Odyssey Wild One Armaf", sku: "OWO-100-01", genero: "hombre" },
  { slug: "pisa-lattafa", nombre: "Pisa Lattafa", sku: "PIL-100-01", genero: "dama" },
];

async function main() {
  // ── 0. Limpiar el slug con guion sobrante ──
  const moshinoNegro = await prisma.product.findUnique({
    where: { slug: "moshino-toy-2-black-" },
  });
  if (moshinoNegro && !(await prisma.product.findUnique({ where: { slug: "moshino-toy-2-black" } }))) {
    if (!dryRun) {
      await prisma.product.update({
        where: { id: moshinoNegro.id },
        data: { slug: "moshino-toy-2-black" },
      });
    }
    console.log('· slug corregido: "moshino-toy-2-black-" → "moshino-toy-2-black"');
  }

  // ── 1. Crear los faltantes ──
  let creados = 0;
  for (const nuevo of FALTANTES) {
    const existe = await prisma.product.findUnique({ where: { slug: nuevo.slug } });
    if (existe) {
      console.log(`· ya existía: ${nuevo.nombre}`);
      continue;
    }
    if (!dryRun) {
      await prisma.product.create({
        data: {
          name: nuevo.nombre,
          slug: nuevo.slug,
          category: nuevo.combo ? "combos" : "perfumes",
          description: nuevo.desc ?? null,
          isActive: false, // todos son borradores en Shopify
          genero: nuevo.genero,
          variants: {
            create: {
              sku: nuevo.sku,
              attributeName: "Tamaño",
              attributeValue: "100ml",
              price: 0, // sin precio en Shopify; se completa en el admin
              stock: 0,
            },
          },
        },
      });
    }
    creados++;
    console.log(`✔ creado (borrador): ${nuevo.nombre}`);
  }

  // ── 2. Sincronizar estado (isActive) de todos los existentes ──
  const productos = await prisma.product.findMany({ select: { id: true, slug: true, name: true, isActive: true } });
  let activados = 0, desactivados = 0;
  for (const p of productos) {
    const slugNorm = p.slug.replace(/-+$/, "");
    const debeEstarActivo = ACTIVOS.has(slugNorm) || ACTIVOS.has(p.slug);
    if (p.isActive === debeEstarActivo) continue;
    if (!dryRun) {
      await prisma.product.update({ where: { id: p.id }, data: { isActive: debeEstarActivo } });
    }
    if (debeEstarActivo) { activados++; }
    else { desactivados++; console.log(`   ↓ a borrador: ${p.name}`); }
  }

  // ── Resumen ──
  const total = await prisma.product.count();
  const activos = await prisma.product.count({ where: { isActive: true } });
  console.log(`\n=== Sincronización ${dryRun ? "(dry-run)" : "aplicada"} ===`);
  console.log(`Creados:            ${creados}`);
  console.log(`Pasados a activo:   ${activados}`);
  console.log(`Pasados a borrador: ${desactivados}`);
  console.log(`Total en Neon:      ${total}  (${activos} activos / ${total - activos} borradores)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
