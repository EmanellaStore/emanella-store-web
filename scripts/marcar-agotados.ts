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
 *   npx tsx scripts/marcar-agotados.ts
 */
import { getInventario, marcarEstados } from "../src/services/inventario.service";
import { resolverColumnas, normalizar, ESTADO_AGOTADO } from "../src/lib/inventario";
import { leerHoja } from "../src/lib/google-sheets";

async function main() {
  const { items } = await getInventario();

  const pendientes = items.filter(
    (i) =>
      i.stock <= 0 &&
      normalizar(i.estado) !== normalizar(ESTADO_AGOTADO) &&
      normalizar(i.estado) !== normalizar("Temporalmente no disponible")
  );

  if (pendientes.length === 0) {
    console.log("Nada que marcar: todos los agotados ya están al día.");
    return;
  }

  console.log(`Se van a marcar ${pendientes.length}:`);
  for (const p of pendientes) {
    console.log(`  fila ${p.fila}  ${p.nombre}  (stock ${p.stock}, "${p.estado}")`);
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
    pendientes.map((p) => ({ fila: p.fila, estado: ESTADO_AGOTADO })),
    colEstado
  );

  console.log("Listo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
