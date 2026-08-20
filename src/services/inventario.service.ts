// src/services/inventario.service.ts — lee y escribe el inventario en el Excel.
// El Google Sheet es la fuente de la verdad. Solo servidor.
import {
  leerHoja,
  escribirCeldas,
  escribirEstados,
  agregarFila,
  sheetsConfigurado,
} from "@/lib/google-sheets";
import {
  resolverColumnas,
  columnaDeCampo,
  letraColumna,
  parseNumero,
  normalizar,
  calcularStock,
  ESTADOS,
  ESTADO_AGOTADO,
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

export interface NuevoProducto {
  nombre: string;
  tipo?: string;
  stockInicial?: number;
  precioCompra?: number;
  precioMayorista?: number;
  precioDetal?: number;
  estado?: string;
}

/**
 * Agrega un producto nuevo al Excel (fila nueva con las fórmulas copiadas de la
 * fila de arriba). Devuelve el número de fila creada.
 */
export async function agregarProducto(datos: NuevoProducto): Promise<number> {
  const nombre = String(datos.nombre ?? "").trim();
  if (!nombre) throw new Error("El nombre es obligatorio");

  const valores: Record<string, string | number> = { nombre };

  if (datos.tipo && datos.tipo.trim()) valores.tipo = datos.tipo.trim();

  const numero = (v: unknown, etiqueta: string): number | null => {
    if (v == null || v === "") return null;
    const n = Math.round(Number(v));
    if (!Number.isFinite(n) || n < 0) throw new Error(`${etiqueta} inválido`);
    return n;
  };

  const si = numero(datos.stockInicial, "Stock inicial");
  if (si != null) valores.stockInicial = si;
  const pc = numero(datos.precioCompra, "Precio de compra");
  if (pc != null) valores.precioCompra = pc;
  const pm = numero(datos.precioMayorista, "Precio mayorista");
  if (pm != null) valores.precioMayorista = pm;
  const pd = numero(datos.precioDetal, "Precio detal");
  if (pd != null) valores.precioDetal = pd;

  if (datos.estado) {
    const estado = String(datos.estado).trim();
    const valido = ESTADOS.some((e) => normalizar(e) === normalizar(estado));
    if (!valido) throw new Error("Estado inválido");
    valores.estado = estado;
  }

  const fila = await agregarFila(valores);
  layoutCache = null; // por si la tabla creció; se recalcula en la próxima lectura
  return fila;
}

/**
 * Escribe el Estado de varias filas pintando la casilla igual que las demás que
 * ya tienen ese estado. Si el Apps Script desplegado todavía no trae la acción
 * `estado`, cae a escribir solo el texto (sin color) en vez de fallar.
 */
export async function marcarEstados(
  updates: { fila: number; estado: string }[],
  colEstado: number
): Promise<void> {
  if (updates.length === 0) return;
  try {
    await escribirEstados(updates);
  } catch (e) {
    if (e instanceof Error && e.message === "SHEETS_SIN_ACCION" && colEstado >= 0) {
      const letra = letraColumna(colEstado);
      await escribirCeldas(
        updates.map((u) => ({ rango: `${letra}${u.fila}`, valor: u.estado }))
      );
      return;
    }
    throw e;
  }
}

export interface LineaVenta {
  descripcion: string;
  cantidad: number;
}

/**
 * Descuenta del Excel las unidades vendidas: por cada producto (emparejado por
 * nombre con la tabla) le suma la cantidad a "Venta Detal", y la fórmula del
 * Excel baja el Stock Disponible. Los ítems que no existen en el inventario
 * (texto libre) se ignoran. Devuelve cuántos se descontaron y cuáles no cuadraron.
 */
export async function descontarPorVenta(
  lineas: LineaVenta[]
): Promise<{ descontados: number; sinCoincidencia: string[]; agotados: number[] }> {
  const items = (lineas ?? []).filter((l) => l && l.descripcion);
  if (items.length === 0)
    return { descontados: 0, sinCoincidencia: [], agotados: [] };

  const { items: inventario } = await getInventario();
  const porNombre = new Map<string, InventarioItem>();
  for (const it of inventario) porNombre.set(normalizar(it.nombre), it);

  // Agrupa por fila (por si el mismo producto va en dos líneas).
  const incrementos = new Map<number, { item: InventarioItem; cantidad: number }>();
  const sinCoincidencia: string[] = [];
  for (const l of items) {
    const cant = Math.max(1, Math.round(Number(l.cantidad) || 1));
    const match = porNombre.get(normalizar(l.descripcion));
    if (!match) {
      sinCoincidencia.push(l.descripcion);
      continue;
    }
    const prev = incrementos.get(match.fila);
    if (prev) prev.cantidad += cant;
    else incrementos.set(match.fila, { item: match, cantidad: cant });
  }

  if (incrementos.size === 0) return { descontados: 0, sinCoincidencia, agotados: [] };

  const { cols } = await getLayout();
  if (cols.ventaDetal < 0) {
    throw new Error("El Excel no tiene columna Venta Detal");
  }
  const letra = letraColumna(cols.ventaDetal);
  const celdas = [...incrementos.values()].map(({ item, cantidad }) => ({
    rango: `${letra}${item.fila}`,
    valor: item.ventaDetal + cantidad,
  }));
  await escribirCeldas(celdas);

  // Si la venta dejó el producto en 0, se marca solo como "Se debe volver a
  // comprar" y la casilla queda pintada igual que las demás agotadas. Solo se
  // toca el estado si cambia: los que ya están marcados se dejan quietos.
  const aMarcar = [...incrementos.values()]
    .filter(
      ({ item, cantidad }) =>
        calcularStock({ ...item, ventaDetal: item.ventaDetal + cantidad }) <= 0 &&
        normalizar(item.estado) !== normalizar(ESTADO_AGOTADO)
    )
    .map(({ item }) => ({ fila: item.fila, estado: ESTADO_AGOTADO }));
  await marcarEstados(aMarcar, cols.estado);

  return {
    descontados: incrementos.size,
    sinCoincidencia,
    agotados: aMarcar.map((m) => m.fila),
  };
}
