// src/lib/cartera.ts — utilidades del módulo de cartera (spec en docs/05-spec-cartera.md)

/**
 * Atajo de miles: en las notas de WhatsApp los montos se escriben "150" para
 * $150.000. Regla: un valor menor a 1.000 se multiplica por mil. Los formularios
 * muestran el resultado en vivo para que siempre se confirme de un vistazo.
 */
export function parseMonto(input: string | number): number {
  if (typeof input === "number") {
    return input > 0 && input < 1000 ? Math.round(input * 1000) : Math.round(input);
  }
  const limpio = String(input).replace(/[^\d,.-]/g, "").replace(/[.,](?=\d{3}\b)/g, "");
  const n = parseFloat(limpio.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n < 1000 ? Math.round(n * 1000) : Math.round(n);
}

export function formatMoney(n: number | string): string {
  return `$${Math.round(Number(n)).toLocaleString("es-CO")}`;
}

/** Plazos que se pueden pactar, en quincenas. */
export const QUINCENAS = [1, 2, 3, 4, 5, 6] as const;

/**
 * Corte de quincena: día 15 y último día del mes. Se devuelve al mediodía a
 * propósito: una fecha a medianoche, guardada en un servidor en UTC, se lee en
 * Colombia (−5) como el día anterior. El mediodía deja el día calendario
 * intacto en ambos husos.
 */
export function siguienteCorte(desde: Date): Date {
  const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const al = (y: number, m: number, dia: number) => new Date(y, m, dia, 12, 0, 0, 0);
  if (d.getDate() < 15) return al(d.getFullYear(), d.getMonth(), 15);
  if (d.getDate() < ultimoDia) return al(d.getFullYear(), d.getMonth(), ultimoDia);
  return al(d.getFullYear(), d.getMonth() + 1, 15);
}

/**
 * Fecha de pago sugerida: por defecto dos quincenas (lo habitual del negocio),
 * ajustable de 1 a 6 desde el formulario.
 */
export function fechaPagoSugerida(desde: Date = new Date(), quincenas = 2): Date {
  let fecha = desde;
  for (let i = 0; i < Math.max(1, quincenas); i++) {
    fecha = siguienteCorte(fecha);
  }
  return fecha;
}

/**
 * Fin de la quincena en la que cae una fecha: el 15 o el último día del mes.
 * A diferencia de `siguienteCorte`, si la fecha YA es un corte devuelve esa
 * misma (no salta a la siguiente).
 */
function finDeQuincena(desde: Date): Date {
  const y = desde.getFullYear();
  const m = desde.getMonth();
  const dia = desde.getDate();
  const ultimoDia = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, dia <= 15 ? 15 : ultimoDia, 12, 0, 0, 0);
}

/**
 * Plazo que compra un abono: el fin de la quincena **siguiente** a aquella en
 * que se abonó.
 *
 * No es `siguienteCorte(fecha)`: eso hacía que el plazo dependiera del día en
 * que cayera el abono — abonar el 1 daba 14 días y abonar el 14 daba uno solo.
 * Marcela abonó el 10 de septiembre y quedaba cubierta solo hasta el 15.
 * Contando desde el cierre de su quincena, siempre se da un período completo
 * (entre 15 y 30 días), sin importar el día.
 */
export function plazoPorAbono(fecha: Date | string): Date {
  return siguienteCorte(finDeQuincena(new Date(fecha)));
}

/**
 * Fecha límite de una cuenta: **el compromiso más reciente**, no el más viejo.
 *
 * Esto es el corazón del cálculo de vencimiento y por eso vive en un solo lugar
 * (la lista y la ficha de la persona lo usan igual). Dos cosas corren el plazo:
 *
 * - **Una venta nueva a crédito**: se pacta una fecha nueva y esa manda, así
 *   haya quedado algo viejo sin pagar.
 * - **Un abono**: da plazo hasta el fin de la quincena siguiente a la del abono
 *   (ver `plazoPorAbono`). Premia a quien está abonando sin perder de vista a
 *   quien se queda callado: si no vuelve a abonar, al pasar ese corte reaparece
 *   en rojo.
 *
 * Devuelve null si no hay ningún compromiso (p. ej. solo ventas de contado).
 */
export function fechaLimiteCuenta(
  fechasPago: (Date | string | null | undefined)[],
  ultimoAbono?: Date | string | null
): Date | null {
  let limite: Date | null = null;
  const considerar = (f: Date | null) => {
    if (f && (!limite || f > limite)) limite = f;
  };

  for (const f of fechasPago) {
    if (f) considerar(new Date(f));
  }
  if (ultimoAbono) considerar(plazoPorAbono(ultimoAbono));

  return limite;
}

/**
 * Convierte "2026-08-15" (input date) en una fecha local. Con `new Date(str)`
 * el navegador la interpreta como UTC y en Colombia (-5) se corre un día atrás.
 */
export function parseFechaLocal(valor: string | Date | null | undefined): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function estaVencida(fechaPago: Date | string | null, saldo: number): boolean {
  if (!fechaPago || saldo <= 0) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(fechaPago) < hoy;
}

export function diasDeAtraso(fechaPago: Date | string | null): number {
  if (!fechaPago) return 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fechaPago);
  f.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((hoy.getTime() - f.getTime()) / 86_400_000));
}

export const METODOS_PAGO = ["Efectivo", "Nequi", "Daviplata", "Transferencia", "Otro"] as const;
