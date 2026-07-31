// scripts/crear-usuario-cartera.ts
// Crea (o reinicia) el usuario compartido del módulo de cartera.
// Rol CARTERA: entra a /cartera pero NO al admin de la tienda.
// Uso: npx tsx scripts/crear-usuario-cartera.ts
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
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
const EMAIL = "cartera@emanellastore.com";

// Sin caracteres ambiguos (0/O, 1/l/I) para que se escriba fácil en el celular
const ALPHABET = "abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789";
function generarClave(len = 12) {
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

async function main() {
  const clave = generarClave();
  const hash = await bcrypt.hash(clave, 10);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password: hash, role: "CARTERA", isActive: true },
    create: {
      email: EMAIL,
      password: hash,
      name: "Cartera",
      lastName: "Emanella",
      role: "CARTERA",
      isActive: true,
    },
    select: { id: true, email: true, role: true },
  });

  console.log("\n=== Usuario de cartera listo ===");
  console.log(`Correo:     ${user.email}`);
  console.log(`Contraseña: ${clave}`);
  console.log(`Rol:        ${user.role}`);
  console.log("\nGuárdala en el gestor de contraseñas del celular.");
  console.log("Volver a correr este script genera una contraseña nueva.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
