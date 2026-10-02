/**
 * Marca como "Se debe volver a comprar" (con la casilla pintada) los productos
 * que ya están en Stock Disponible 0 pero siguen figurando "En stock" — casos
 * que se agotaron antes de que la app marcara el estado sola.
 *
 * NO toca los que están en "Temporalmente no disponible": esos están en 0 a
 * propósito (nunca se compraron / no se consiguen), no por una venta.
 *
 * Requiere que el Apps Script desplegado tenga la acción `estado` (ver
 * docs/07-inventario-conexion-google.md). Sin ella escribe el texto sin color.
 *
 *   npx tsx --env-file=.env.local scripts/marcar-agotados.ts [--repintar]
 */
import { getInventario, marcarEstados } from "../src/services/inventario.service";
import {
  resolverColumnas,
  normalizar,
  ESTADO_AGOTADO,
  ESTADO_EN_STOCK,
} from "../src/lib/inventario";
import { leerHoja, leerColores } from "../src/lib/google-sheets";

async function main() {
  const { items } = await getInventario();

  // --repintar: además, las que YA dicen "Se debe volver a comprar" en 0 pero cuya
  // casilla de Stock Disponible sigue con el color de "con unidades" (verde): las
  // que la app marcó cuando solo pintaba la casilla de Estado. Las que tienen otro
  // color (p. ej. un naranja puesto a mano) no se tocan.
  const repintar = process.argv.includes("--repintar");
  let colorConUnidades: string | null = null;
  let colorEnCero: string | null = null;
  const colorDe = new Map<number, string | null>();
  if (repintar) {
    const colores = await leerColores();
    const conUnidades = new Map<string, number>();
    const enCero = new Map<string, number>();
    for (const c of colores) {
      colorDe.set(c.fila, c.fondoStock);
      if (!c.fondoStock) continue;
      const m = Number(c.stock) > 0 ? conUnidades : enCero;
      m.set(c.fondoStock, (m.get(c.fondoStock) ?? 0) + 1);
    }
    const masComun = (m: Map<string, number>) =>
      [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    colorConUnidades = masComun(conUnidades);
    colorEnCero = masComun(enCero);
    console.log(`Color de "con unidades": ${colorConUnidades} · "en 0": ${colorEnCero}`);
  }

  const pendientes = items.filter((i) => {
    if (i.stock > 0) return false;
    const e = normalizar(i.estado);
    if (e === normalizar("Temporalmente no disponible")) return false;
    if (e !== normalizar(ESTADO_AGOTADO)) return true; // en 0 sin marcar
    return repintar && colorConUnidades !== null && colorDe.get(i.fila) === colorConUnidades;
  });

  // --repintar, al revés: "En stock" con unidades pero con la casilla todavía en
  // el color de "en 0" (naranja): las que se reabastecieron desde la app antes de
  // que guardar repintara. "Temporalmente no disponible" no se toca.
  const reabastecidas = repintar
    ? items.filter(
        (i) =>
          i.stock > 0 &&
          normalizar(i.estado) === normalizar(ESTADO_EN_STOCK) &&
          colorEnCero !== null &&
          colorDe.get(i.fila) === colorEnCero
      )
    : [];
  if (reabastecidas.length > 0) {
    console.log(`Se van a repintar ${reabastecidas.length} con stock:`);
    for (const r of reabastecidas) {
      console.log(`  fila ${r.fila}  ${r.nombre}  (stock ${r.stock}, "${r.estado}")`);
    }
  }

  if (pendientes.length === 0 && reabastecidas.length === 0) {
    console.log("Nada que marcar: todos los agotados ya están al día.");
    return;
  }

  if (pendientes.length > 0) {
    console.log(`Se van a marcar ${pendientes.length} agotadas:`);
    for (const p of pendientes) {
      console.log(`  fila ${p.fila}  ${p.nombre}  (stock ${p.stock}, "${p.estado}")`);
    }
  }

  // Columna de Estado, para el modo sin color.
  const { valores } = await leerHoja();
  let colEstado = -1;
  for (const fila of valores) {
    const cols = resolverColumnas(fila);
    if (cols) {
      colEstado = cols.estado;
      break;
    }
  }

  await marcarEstados(
    [
      ...pendientes.map((p) => ({ fila: p.fila, estado: ESTADO_AGOTADO })),
      ...reabastecidas.map((r) => ({ fila: r.fila, estado: r.estado })),
    ],
    colEstado
  );

  console.log("Listo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
