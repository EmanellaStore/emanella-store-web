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

// ── Hora Colombia ────────────────────────────────────────────────────────────
// Todo el cálculo de días se hace sobre el calendario de Colombia, sin importar
// dónde corra el código. Vercel corre en UTC (5 h adelante): antes, lo que se
// registraba después de las 7 p. m. salía con fecha del día siguiente y "hoy"
// cambiaba a las 7 p. m. Colombia no tiene horario de verano: UTC−5 fijo todo el
// año, así que basta con un desfase constante.
export const ZONA_CO = "America/Bogota";
const DESFASE_CO = 5 * 3_600_000;
const DIA = 86_400_000;

/** Año, mes (0-11) y día de un instante, en calendario de Colombia. */
function partesCO(f: Date): { y: number; m: number; d: number } {
  const c = new Date(f.getTime() - DESFASE_CO);
  return { y: c.getUTCFullYear(), m: c.getUTCMonth(), d: c.getUTCDate() };
}

/**
 * Mediodía en Colombia de un día calendario. Se guarda al mediodía a propósito:
 * queda en el mismo día calendario se lea desde donde se lea. Acepta meses y
 * días desbordados (mes 12 → enero del año siguiente; día 0 → último del mes
 * anterior), como `Date.UTC`.
 */
function mediodiaCO(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m, d, 17)); // 12:00 en Colombia = 17:00 UTC
}

/** Número de día en calendario de Colombia (para comparar días, no horas). */
function diaCO(f: Date | string): number {
  return Math.floor((new Date(f).getTime() - DESFASE_CO) / DIA);
}

function ultimoDiaDelMes(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

/** "2026-09-28" del día calendario de Colombia (para los `<input type="date">`). */
export function aInputDate(f: Date): string {
  const { y, m, d } = partesCO(f);
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Corte de quincena siguiente a una fecha: el 15 o el último día del mes. */
export function siguienteCorte(desde: Date): Date {
  const { y, m, d } = partesCO(desde);
  const ultimo = ultimoDiaDelMes(y, m);
  if (d < 15) return mediodiaCO(y, m, 15);
  if (d < ultimo) return mediodiaCO(y, m, ultimo);
  return mediodiaCO(y, m + 1, 15);
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
  const { y, m, d } = partesCO(desde);
  return mediodiaCO(y, m, d <= 15 ? 15 : ultimoDiaDelMes(y, m));
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
 * Convierte "2026-08-15" (input date) en el mediodía de ese día en Colombia.
 * Con `new Date(str)` se interpreta como medianoche UTC, que en Colombia es el
 * día anterior.
 */
export function parseFechaLocal(valor: string | Date | null | undefined): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (m) return mediodiaCO(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fecha legible, siempre en calendario de Colombia ("28 de sept de 2026"). */
export function formatFecha(fecha: Date | string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: ZONA_CO,
  });
}

/** Vencida = su día de pago ya pasó en Colombia (el mismo día aún no vence). */
export function estaVencida(fechaPago: Date | string | null, saldo: number): boolean {
  if (!fechaPago || saldo <= 0) return false;
  return diaCO(fechaPago) < diaCO(new Date());
}

export function diasDeAtraso(fechaPago: Date | string | null): number {
  if (!fechaPago) return 0;
  return Math.max(0, diaCO(new Date()) - diaCO(fechaPago));
}

export const METODOS_PAGO = ["Efectivo", "Nequi", "Daviplata", "Transferencia", "Otro"] as const;

interface VentaCiclo {
  fecha: Date;
  total: number | string | { toString(): string };
  tipo: string;
  anulada?: boolean;
}
interface AbonoCiclo {
  fecha: Date;
  monto: number | string | { toString(): string };
}

/**
 * Ciclo actual de una cuenta: lo que pasó desde la última vez que la persona
 * quedó en $0. Lo que ya pagó por completo antes no aparece en el resumen ni en
 * el estado de cuenta (antes se sumaba todo el historial: "Fiado $570.000" cuando
 * lo vigente eran $420.000).
 *
 * - `ventas`: las ventas a crédito del ciclo (las de contado se pagan solas).
 * - `fiado`: suma de esas ventas.
 * - `abonado`: fiado − saldo. Derivado a propósito: así `fiado − abonado` siempre
 *   cuadra con lo que debe, aunque haya quedado un saldo a favor de antes.
 */
export function cicloActual<V extends VentaCiclo, A extends AbonoCiclo>(
  ventas: V[],
  abonos: A[]
): { ventas: V[]; fiado: number; abonado: number; saldo: number } {
  type Ev = { fecha: number; orden: number; monto: number; venta?: V };
  const eventos: Ev[] = [
    ...ventas
      .filter((v) => !v.anulada)
      .map((v) => ({
        fecha: new Date(v.fecha).getTime(),
        orden: 0, // el mismo día, primero la venta y luego el abono
        monto: Number(v.total),
        venta: v,
      })),
    ...abonos.map((a) => ({
      fecha: new Date(a.fecha).getTime(),
      orden: 1,
      monto: -Number(a.monto),
    })),
  ].sort((a, b) => a.fecha - b.fecha || a.orden - b.orden);

  // Corte: justo después del último momento en que el saldo quedó en ≤ 0.
  let saldo = 0;
  let corte = 0;
  eventos.forEach((e, i) => {
    saldo += e.monto;
    if (Math.round(saldo) <= 0) corte = i + 1;
  });

  const delCiclo = eventos
    .slice(corte)
    .flatMap((e) => (e.venta && e.venta.tipo === "CREDITO" ? [e.venta] : []));
  const fiado = delCiclo.reduce((s, v) => s + Number(v.total), 0);
  const saldoFinal = Math.max(0, Math.round(saldo));

  return {
    ventas: delCiclo,
    fiado: Math.round(fiado),
    abonado: Math.max(0, Math.round(fiado) - saldoFinal),
    saldo: saldoFinal,
  };
}
