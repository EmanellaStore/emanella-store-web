// scripts/generar-icono-tienda.mjs
// Genera el ícono/favicon de la tienda con el monograma EA de la marca sobre
// lila polvo. Reemplaza el icon.png anterior, que era de otra marca ("Elysium").
// Uso: node scripts/generar-icono-tienda.mjs
import sharp from "sharp";

const SRC = "public/logo-emanella.png"; // versión oscura, para fondo claro
const LILA = { r: 0xec, g: 0xe6, b: 0xf0, alpha: 1 };

const meta = await sharp(SRC).metadata();
const lado = meta.height;

// El monograma (círculo EA) ocupa la franja izquierda del logo, de alto completo.
const monograma = await sharp(SRC)
  .extract({ left: 0, top: 0, width: lado, height: lado })
  .resize(400, 400, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

for (const { size, file } of [
  { size: 512, file: "public/icon.png" },
  { size: 180, file: "public/apple-icon.png" },
]) {
  const escala = Math.round((400 / 512) * size);
  const capa = await sharp(monograma).resize(escala, escala).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: LILA },
  })
    .composite([{ input: capa, gravity: "center" }])
    .png()
    .toFile(file);
  console.log(`generado ${file} (${size}px)`);
}
