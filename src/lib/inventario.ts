// src/lib/inventario.ts — utilidades del módulo de inventario.
// Puro (sin dependencias de servidor): se puede usar en cliente y servidor.
// El Excel de Google Sheets es la única fuente de la verdad; aquí solo van
// helpers de formato, parseo y resolución de columnas por su encabezado.

/** Estados posibles de un artículo (tal cual el Excel). */
export const ESTADOS = [
  "En stock",
  "Temporalmente no disponible",
  "Se debe volver a comprar",
] as const;

export type Estado = (typeof ESTADOS)[number];

/**
 * Campos editables desde la app y su columna en el Excel. OJO: NO se edita
 * "Stock Disponible" porque es una FÓRMULA en el Excel
 * (= Stock Inicial − Venta Detal − Venta Mayorista − Regalos). En su lugar se
 * editan las entradas: Venta Detal (registrar ventas) y Stock Inicial (reabastecer).
 */
export type CampoInventario =
  | "stockInicial"
  | "ventaDetal"
  | "precioCompra"
  | "precioMayorista"
  | "precioDetal"
  | "estado";

/** Un artículo del inventario, con su número de fila en el Excel (1-based). */
export interface InventarioItem {
  fila: number;
  nombre: string;
  tipo: string;
  /** Stock Disponible: valor calculado por la fórmula del Excel (solo lectura). */
  stock: number;
  stockInicial: number;
  ventaDetal: number;
  ventaMayorista: number;
  regalos: number;
  precioCompra: number;
  precioMayorista: number;
  precioDetal: number;
  estado: string;
}

/**
 * Calcula el stock disponible como lo hace el Excel. Sirve para previsualizar el
 * resultado en la app antes de que la fórmula recalcule en la hoja.
 */
export function calcularStock(item: {
  stockInicial: number;
  ventaDetal: number;
  ventaMayorista: number;
  regalos: number;
}): number {
  return item.stockInicial - item.ventaDetal - item.ventaMayorista - item.regalos;
}

export function formatMoney(n: number | string): string {
  const v = Math.round(Number(n) || 0);
  return `$${v.toLocaleString("es-CO")}`;
}

/** Convierte "$40,000.00" | "-$40.000" | 40000 → número (0 si no aplica). */
export function parseNumero(input: unknown): number {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  if (input == null) return 0;
  const s = String(input).trim();
  if (!s) return 0;
  const negativo = s.startsWith("-") || /\(\s*\$?[\d.,]+\s*\)/.test(s);
  const limpio = s.replace(/[^\d.,]/g, "");
  if (!limpio) return 0;
  // El Excel usa formato en-US: coma = miles, punto = decimal.
  const n = parseFloat(limpio.replace(/,/g, ""));
  if (!Number.isFinite(n)) return 0;
  return negativo ? -n : n;
}

/** Normaliza texto para comparar encabezados: minúsculas, sin tildes, sin dobles espacios. */
export function normalizar(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Índice de columna (0-based) → letra A1 ("A", "B", … "AA"). */
export function letraColumna(indice: number): string {
  let n = indice + 1;
  let letra = "";
  while (n > 0) {
    const resto = (n - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    n = Math.floor((n - 1) / 26);
  }
  return letra;
}

/** Mapa de campo → índice de columna (0-based), resuelto desde la fila de encabezados. */
export interface Columnas {
  nombre: number;
  tipo: number;
  stock: number; // Stock Disponible (fórmula, solo lectura)
  stockInicial: number;
  ventaDetal: number;
  ventaMayorista: number;
  regalos: number;
  precioCompra: number;
  precioMayorista: number;
  precioDetal: number;
  estado: number;
}

/**
 * Encuentra en una fila los encabezados de la tabla principal y mapea cada campo
 * a su columna. Devuelve null si la fila no contiene la tabla esperada.
 * Tolera los typos del Excel ("Precio Deltal", tildes, mayúsculas).
 */
export function resolverColumnas(fila: unknown[]): Columnas | null {
  const cols: Partial<Columnas> = {};
  fila.forEach((celda, i) => {
    const h = normalizar(celda);
    if (h === "nombre del articulo") cols.nombre = i;
    else if (h === "tipo") cols.tipo = i;
    else if (h === "stock disponible") cols.stock = i;
    else if (h === "stock inicial") cols.stockInicial = i;
    // "venta detal" = contador de ventas (entrada de la fórmula). NO es "precio detal".
    else if (h === "venta detal") cols.ventaDetal = i;
    else if (h === "venta mayorista") cols.ventaMayorista = i;
    else if (h === "regalos") cols.regalos = i;
    else if (h === "precio compra") cols.precioCompra = i;
    else if (h === "precio mayorista") cols.precioMayorista = i;
    // "precio detal" / "precio deltal" (el público). Ojo: NO es "venta detal".
    else if (h === "precio detal" || h === "precio deltal") cols.precioDetal = i;
    else if (h === "estado") cols.estado = i;
  });
  if (
    cols.nombre == null ||
    cols.stock == null ||
    cols.precioDetal == null ||
    cols.estado == null
  ) {
    return null;
  }
  return {
    nombre: cols.nombre,
    tipo: cols.tipo ?? -1,
    stock: cols.stock,
    stockInicial: cols.stockInicial ?? -1,
    ventaDetal: cols.ventaDetal ?? -1,
    ventaMayorista: cols.ventaMayorista ?? -1,
    regalos: cols.regalos ?? -1,
    precioCompra: cols.precioCompra ?? -1,
    precioMayorista: cols.precioMayorista ?? -1,
    precioDetal: cols.precioDetal,
    estado: cols.estado,
  };
}

/** Columna (0-based) del Excel para cada campo editable, según el mapa resuelto. */
export function columnaDeCampo(campo: CampoInventario, cols: Columnas): number {
  switch (campo) {
    case "stockInicial":
      return cols.stockInicial;
    case "ventaDetal":
      return cols.ventaDetal;
    case "precioCompra":
      return cols.precioCompra;
    case "precioMayorista":
      return cols.precioMayorista;
    case "precioDetal":
      return cols.precioDetal;
    case "estado":
      return cols.estado;
  }
}
