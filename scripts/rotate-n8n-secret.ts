// scripts/rotate-n8n-secret.ts
// Rota el N8N_SECRET (autorizado por Steven 2026-07-08): genera un token nuevo,
// lo escribe en .env / .env.local y reemplaza el valor viejo hardcodeado en
// los flujos n8n versionados (src/flows/*.json).
// Uso: npx tsx scripts/rotate-n8n-secret.ts
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { resolve, join } from "path";
import { randomBytes } from "crypto";

const OLD_SECRET = "25624e724c76f9e80260561e56623219b1f7285193d527a36c243d4ea4879c98";
const newSecret = randomBytes(32).toString("hex");

let replacedFiles: string[] = [];

function replaceInFile(path: string) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  if (!content.includes(OLD_SECRET)) return;
  writeFileSync(path, content.split(OLD_SECRET).join(newSecret));
  replacedFiles.push(path);
}

replaceInFile(resolve(".env"));
replaceInFile(resolve(".env.local"));

const flowsDir = resolve("src/flows");
for (const f of readdirSync(flowsDir)) {
  if (f.endsWith(".json")) replaceInFile(join(flowsDir, f));
}

console.log(`Nuevo N8N_SECRET (prefijo): ${newSecret.slice(0, 8)}…`);
console.log(`Archivos actualizados (${replacedFiles.length}):`);
replacedFiles.forEach((f) => console.log(`  - ${f}`));
if (replacedFiles.length === 0) {
  console.log("El valor viejo no se encontró: nada que rotar (¿ya rotado?).");
}
