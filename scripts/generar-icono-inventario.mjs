// scripts/generar-icono-inventario.mjs
// Ícono de la PWA de Inventario: monograma EA en champán (para distinguirlo de
// Cartera, que va en blanco) sobre el grafito Emanella, en 512 y 192 px.
// Uso: node scripts/generar-icono-inventario.mjs
import sharp from "sharp";

const SRC = "public/logo-emanella-white.png";
const GRAFITO = { r: 0x2a, g: 0x23, b: 0x30, alpha: 1 };
const CHAMPAN = { r: 0xb0, g: 0x91, b: 0x5f }; // acento joya de la marca

const meta = await sharp(SRC).metadata();
const lado = meta.height;

// El monograma (círculo EA) ocupa la franja izquierda, de alto completo.
const monograma = await sharp(SRC)
  .extract({ left: 0, top: 0, width: lado, height: lado })
  .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .tint(CHAMPAN)
  .png()
  .toBuffer();

for (const size of [512, 192]) {
  const escala = Math.round((360 / 512) * size);
  const capa = await sharp(monograma).resize(escala, escala).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: GRAFITO },
  })
    .composite([{ input: capa, gravity: "center" }])
    .png()
    .toFile(`public/inventario-icon-${size}.png`);
  console.log(`generado public/inventario-icon-${size}.png`);
}
