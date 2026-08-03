// src/services/inventario.service.ts — lee y escribe el inventario en el Excel.
// El Google Sheet es la fuente de la verdad. Solo servidor.
import {
  leerHoja,
  escribirCeldas,
  sheetsConfigurado,
} from "@/lib/google-sheets";
import {
  resolverColumnas,
  columnaDeCampo,
  letraColumna,
  parseNumero,
  normalizar,
  ESTADOS,
  type Columnas,
  type InventarioItem,
  type CampoInventario,
} from "@/lib/inventario";

export { sheetsConfigurado };

interface Layout {
  cols: Columnas;
  filaEncabezado: number; // 1-based
}

// Cache del layout (columnas de la tabla). No cambia entre ediciones.
let layoutCache: { data: Layout; exp: number } | null = null;
const LAYOUT_TTL = 5 * 60 * 1000;

/** Lee toda la tabla principal del Excel. */
export async function getInventario(): Promise<{
  items: InventarioItem[];
  titulo: string;
}> {
  const { titulo, valores: filas } = await leerHoja();

  // Encuentra la fila de encabezados de la tabla principal.
  let idxEncabezado = -1;
  let cols: Columnas | null = null;
  for (let i = 0; i < filas.length; i++) {
    const resuelto = resolverColumnas(filas[i]);
    if (resuelto) {
      idxEncabezado = i;
      cols = resuelto;
      break;
    }
  }
  if (!cols || idxEncabezado === -1) {
    throw new Error("SHEETS_SIN_TABLA");
  }

  layoutCache = {
    data: { cols, filaEncabezado: idxEncabezado + 1 },
    exp: Date.now() + LAYOUT_TTL,
  };

  const items: InventarioItem[] = [];
  for (let i = idxEncabezado + 1; i < filas.length; i++) {
    const fila = filas[i];
    const nombre = String(fila[cols.nombre] ?? "").trim();
    if (!nombre) break; // fin de la tabla principal (empieza otra o hay vacío)
    const num = (col: number) => (col >= 0 ? Math.round(parseNumero(fila[col])) : 0);
    items.push({
      fila: i + 1, // número de fila real en el Excel (1-based)
      nombre,
      tipo: cols.tipo >= 0 ? String(fila[cols.tipo] ?? "").trim() : "",
      stock: num(cols.stock),
      stockInicial: num(cols.stockInicial),
      ventaDetal: num(cols.ventaDetal),
      ventaMayorista: num(cols.ventaMayorista),
      regalos: num(cols.regalos),
      precioCompra:
        cols.precioCompra >= 0 ? parseNumero(fila[cols.precioCompra]) : 0,
      precioMayorista:
        cols.precioMayorista >= 0 ? parseNumero(fila[cols.precioMayorista]) : 0,
      precioDetal: parseNumero(fila[cols.precioDetal]),
      estado: String(fila[cols.estado] ?? "").trim(),
    });
  }

  return { items, titulo };
}

async function getLayout(): Promise<Layout> {
  if (layoutCache && layoutCache.exp > Date.now()) return layoutCache.data;
  // Re-leer para reconstruir el layout (título + columnas).
  await getInventario();
  if (!layoutCache) throw new Error("SHEETS_SIN_TABLA");
  return layoutCache.data;
}

export interface PatchInventario {
  stockInicial?: number;
  ventaDetal?: number;
  precioCompra?: number;
  precioMayorista?: number;
  precioDetal?: number;
  estado?: string;
}

/**
 * Actualiza una fila del Excel con los campos dados. Escribe solo en las columnas
 * de ENTRADA (Stock Inicial, Venta Detal, precios, estado); nunca en Stock
 * Disponible ni en las demás columnas de fórmula. Valida estado y números.
 */
export async function actualizarProducto(
  fila: number,
  patch: PatchInventario
): Promise<void> {
  if (!Number.isInteger(fila) || fila < 2) {
    throw new Error("Fila inválida");
  }
  const { cols } = await getLayout();

  const celdas: { rango: string; valor: string | number }[] = [];

  const pushCelda = (campo: CampoInventario, valor: string | number) => {
    const colIdx = columnaDeCampo(campo, cols);
    if (colIdx < 0) return; // esa columna no existe en el Excel: se ignora
    celdas.push({ rango: `${letraColumna(colIdx)}${fila}`, valor });
  };

  if (patch.stockInicial != null) {
    const n = Math.round(Number(patch.stockInicial));
    if (!Number.isFinite(n) || n < 0) throw new Error("Stock inicial inválido");
    if (cols.stockInicial < 0) throw new Error("El Excel no tiene columna Stock Inicial");
    pushCelda("stockInicial", n);
  }
  if (patch.ventaDetal != null) {
    const n = Math.round(Number(patch.ventaDetal));
    if (!Number.isFinite(n) || n < 0) throw new Error("Venta detal inválida");
    if (cols.ventaDetal < 0) throw new Error("El Excel no tiene columna Venta Detal");
    pushCelda("ventaDetal", n);
  }
  if (patch.precioCompra != null) {
    const n = Math.round(Number(patch.precioCompra));
    if (!Number.isFinite(n) || n < 0) throw new Error("Precio de compra inválido");
    pushCelda("precioCompra", n);
  }
  if (patch.precioMayorista != null) {
    const n = Math.round(Number(patch.precioMayorista));
    if (!Number.isFinite(n) || n < 0) throw new Error("Precio mayorista inválido");
    pushCelda("precioMayorista", n);
  }
  if (patch.precioDetal != null) {
    const n = Math.round(Number(patch.precioDetal));
    if (!Number.isFinite(n) || n < 0) throw new Error("Precio detal inválido");
    pushCelda("precioDetal", n);
  }
  if (patch.estado != null) {
    const estado = String(patch.estado).trim();
    const valido = ESTADOS.some((e) => normalizar(e) === normalizar(estado));
    if (!valido) throw new Error("Estado inválido");
    pushCelda("estado", estado);
  }

  if (celdas.length === 0) throw new Error("Nada que actualizar");
  await escribirCeldas(celdas);
}
