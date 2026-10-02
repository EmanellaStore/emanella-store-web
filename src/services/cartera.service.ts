// src/services/cartera.service.ts — lógica del módulo de cartera (fiados y abonos).
// Saldo de una persona = Σ ventas no anuladas − Σ abonos.
// Las ventas de CONTADO nacen con un abono automático por el total, así el saldo
// queda en cero y el historial conserva el movimiento completo.
import db from "@/lib/db";
import { getInventario } from "./inventario.service";
import { normalizar, type InventarioItem } from "@/lib/inventario";
import {
  fechaLimiteCuenta,
  estaVencida,
  aInputDate,
  formatHora,
  formatDiaLargo,
  formatMes,
} from "@/lib/cartera";

export interface ItemVentaInput {
  productId?: string | null;
  variantId?: string | null;
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface CrearVentaInput {
  clienteId?: string;
  clienteNombre?: string;
  clienteTelefono?: string | null;
  tipo: "CREDITO" | "CONTADO";
  fecha?: Date;
  fechaPago?: Date | null;
  notas?: string | null;
  metodoPago?: string | null; // solo contado
  items: ItemVentaInput[];
  createdBy?: string | null;
}

export interface ClienteConSaldo {
  id: string;
  nombre: string;
  telefono: string | null;
  totalVentas: number;
  totalAbonos: number;
  saldo: number;
  proximoVencimiento: Date | null;
  vencido: boolean;
}

/** Lista de personas con su saldo. Por defecto solo las que deben. */
export async function getClientesConSaldo(opciones?: {
  q?: string;
  incluirSaldados?: boolean;
}): Promise<ClienteConSaldo[]> {
  const q = opciones?.q?.trim();

  const clientes = await db.carteraCliente.findMany({
    where: {
      activo: true,
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: "insensitive" as const } },
              { telefono: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { nombre: "asc" },
  });
  if (clientes.length === 0) return [];

  const ids = clientes.map((c) => c.id);

  const [ventas, abonos, pendientes, ultimosAbonos] = await Promise.all([
    db.carteraVenta.groupBy({
      by: ["clienteId"],
      _sum: { total: true },
      where: { clienteId: { in: ids }, anulada: false },
    }),
    db.carteraAbono.groupBy({
      by: ["clienteId"],
      _sum: { monto: true },
      where: { clienteId: { in: ids } },
    }),
    db.carteraVenta.findMany({
      where: {
        clienteId: { in: ids },
        anulada: false,
        tipo: "CREDITO",
        fechaPago: { not: null },
      },
      select: { clienteId: true, fechaPago: true },
      // Descendente: manda el compromiso MÁS RECIENTE. Con la fecha más vieja,
      // ni un abono ni una venta nueva sacaban a nadie del rojo.
      orderBy: { fechaPago: "desc" },
    }),
    db.carteraAbono.groupBy({
      by: ["clienteId"],
      _max: { fecha: true },
      where: { clienteId: { in: ids } },
    }),
  ]);

  const ventasPorCliente = new Map(ventas.map((v) => [v.clienteId, Number(v._sum.total ?? 0)]));
  const abonosPorCliente = new Map(abonos.map((a) => [a.clienteId, Number(a._sum.monto ?? 0)]));
  // La primera de cada cliente es la más tardía (orderBy desc).
  const ultimaFechaPago = new Map<string, Date>();
  for (const p of pendientes) {
    if (p.fechaPago && !ultimaFechaPago.has(p.clienteId)) {
      ultimaFechaPago.set(p.clienteId, p.fechaPago);
    }
  }
  const ultimoAbonoPorCliente = new Map(
    ultimosAbonos.map((a) => [a.clienteId, a._max.fecha])
  );

  return clientes
    .map((c) => {
      const totalVentas = ventasPorCliente.get(c.id) ?? 0;
      const totalAbonos = abonosPorCliente.get(c.id) ?? 0;
      const saldo = Math.round(totalVentas - totalAbonos);
      const proximoVencimiento = fechaLimiteCuenta(
        [ultimaFechaPago.get(c.id) ?? null],
        ultimoAbonoPorCliente.get(c.id) ?? null
      );
      return {
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
        totalVentas,
        totalAbonos,
        saldo,
        proximoVencimiento,
        vencido: estaVencida(proximoVencimiento, saldo),
      };
    })
    .filter((c) => (opciones?.incluirSaldados ? true : c.saldo > 0))
    .sort((a, b) => {
      if (a.vencido !== b.vencido) return a.vencido ? -1 : 1;
      return b.saldo - a.saldo;
    });
}

export async function getResumenCartera() {
  const [ventas, abonos, clientes] = await Promise.all([
    db.carteraVenta.aggregate({ _sum: { total: true }, where: { anulada: false } }),
    db.carteraAbono.aggregate({ _sum: { monto: true } }),
    getClientesConSaldo(),
  ]);
  return {
    totalPorCobrar: Math.round(
      Number(ventas._sum.total ?? 0) - Number(abonos._sum.monto ?? 0)
    ),
    personasQueDeben: clientes.length,
    vencidos: clientes.filter((c) => c.vencido).length,
  };
}

/** Ficha completa: ventas con sus ítems, abonos y saldo. */
export async function getFichaCliente(clienteId: string) {
  const cliente = await db.carteraCliente.findUnique({
    where: { id: clienteId },
    include: {
      ventas: {
        include: { items: true },
        orderBy: { fecha: "desc" },
      },
      abonos: { orderBy: { fecha: "desc" } },
    },
  });
  if (!cliente) return null;

  const totalVentas = cliente.ventas
    .filter((v) => !v.anulada)
    .reduce((s, v) => s + Number(v.total), 0);
  const totalAbonos = cliente.abonos.reduce((s, a) => s + Number(a.monto), 0);

  return {
    ...cliente,
    totalVentas,
    totalAbonos,
    saldo: Math.round(totalVentas - totalAbonos),
  };
}

export async function crearCliente(data: {
  nombre: string;
  telefono?: string | null;
  notas?: string | null;
}) {
  return db.carteraCliente.create({
    data: {
      nombre: data.nombre.trim(),
      telefono: data.telefono?.trim() || null,
      notas: data.notas?.trim() || null,
    },
  });
}

export async function crearVenta(input: CrearVentaInput) {
  const items = input.items.filter((i) => i.descripcion.trim() && i.precio > 0);
  if (items.length === 0) throw new Error("Agrega al menos un producto con precio");

  const total = items.reduce((s, i) => s + i.precio * Math.max(1, i.cantidad), 0);

  return db.$transaction(async (tx) => {
    let clienteId = input.clienteId;

    if (!clienteId) {
      if (!input.clienteNombre?.trim()) throw new Error("Falta el nombre de la persona");
      const nuevo = await tx.carteraCliente.create({
        data: {
          nombre: input.clienteNombre.trim(),
          telefono: input.clienteTelefono?.trim() || null,
        },
      });
      clienteId = nuevo.id;
    }

    const venta = await tx.carteraVenta.create({
      data: {
        clienteId,
        tipo: input.tipo,
        fecha: input.fecha ?? new Date(),
        fechaPago: input.tipo === "CREDITO" ? (input.fechaPago ?? null) : null,
        total,
        notas: input.notas?.trim() || null,
        createdBy: input.createdBy ?? null,
        items: {
          create: items.map((i) => ({
            productId: i.productId || null,
            variantId: i.variantId || null,
            descripcion: i.descripcion.trim(),
            cantidad: Math.max(1, i.cantidad),
            precio: i.precio,
          })),
        },
      },
      include: { items: true },
    });

    // El contado queda pago de una vez: se registra el abono equivalente.
    if (input.tipo === "CONTADO") {
      await tx.carteraAbono.create({
        data: {
          clienteId,
          ventaId: venta.id,
          fecha: venta.fecha,
          monto: total,
          metodo: input.metodoPago || "Efectivo",
          nota: "Pago de contado",
          createdBy: input.createdBy ?? null,
        },
      });
    }

    return venta;
  });
}

export async function crearAbono(data: {
  clienteId: string;
  monto: number;
  fecha?: Date;
  metodo?: string | null;
  nota?: string | null;
  createdBy?: string | null;
}) {
  if (!data.monto || data.monto <= 0) throw new Error("El abono debe ser mayor a cero");
  return db.carteraAbono.create({
    data: {
      clienteId: data.clienteId,
      fecha: data.fecha ?? new Date(),
      monto: data.monto,
      metodo: data.metodo?.trim() || null,
      nota: data.nota?.trim() || null,
      createdBy: data.createdBy ?? null,
    },
  });
}

/** Lo que hay que devolverle al Excel cuando una venta se deshace. */
export interface Devolucion {
  descripcion: string;
  cantidad: number;
}

/**
 * Anular deja rastro (no borra). Si era de contado, se quita su abono automático.
 * Devuelve los ítems que hay que reponer en el inventario — vacío si la venta ya
 * estaba anulada, para no sumar el stock dos veces.
 */
export async function anularVenta(
  ventaId: string
): Promise<{ devolver: Devolucion[] }> {
  return db.$transaction(async (tx) => {
    const venta = await tx.carteraVenta.findUnique({
      where: { id: ventaId },
      include: { items: true },
    });
    if (!venta) throw new Error("Venta no encontrada");
    if (venta.anulada) return { devolver: [] }; // ya se repuso al anularla
    if (venta.tipo === "CONTADO") {
      await tx.carteraAbono.deleteMany({ where: { ventaId } });
    }
    await tx.carteraVenta.update({
      where: { id: ventaId },
      data: { anulada: true },
    });
    return {
      devolver: venta.items.map((i) => ({
        descripcion: i.descripcion,
        cantidad: i.cantidad,
      })),
    };
  });
}

export async function eliminarAbono(abonoId: string) {
  return db.carteraAbono.delete({ where: { id: abonoId } });
}

/** Eliminar de verdad una venta (por si se registró por error). Sus ítems se
 *  borran en cascada; los abonos ligados quedan sueltos (ventaId → null).
 *  Devuelve lo que hay que reponer en el inventario: vacío si ya estaba anulada
 *  (en ese momento ya se repuso). */
export async function eliminarVenta(
  ventaId: string
): Promise<{ devolver: Devolucion[] }> {
  const venta = await db.carteraVenta.findUnique({
    where: { id: ventaId },
    include: { items: true },
  });
  if (!venta) throw new Error("Venta no encontrada");

  await db.carteraVenta.delete({ where: { id: ventaId } });

  if (venta.anulada) return { devolver: [] };
  return {
    devolver: venta.items.map((i) => ({
      descripcion: i.descripcion,
      cantidad: i.cantidad,
    })),
  };
}

/**
 * Quitar un solo producto de una venta (el cliente devolvió uno de varios).
 * Recalcula el total de la venta con lo que queda y devuelve la línea retirada
 * para reponerla en el Excel. Si era el único ítem, la venta entera se elimina.
 */
export async function quitarItemDeVenta(
  itemId: string
): Promise<{ devolver: Devolucion[]; ventaEliminada: boolean; ventaId: string }> {
  const item = await db.carteraVentaItem.findUnique({
    where: { id: itemId },
    include: { venta: { include: { items: true } } },
  });
  if (!item) throw new Error("Producto no encontrado");

  const venta = item.venta;
  const devolver: Devolucion[] = venta.anulada
    ? [] // anulada: el stock ya se había repuesto
    : [{ descripcion: item.descripcion, cantidad: item.cantidad }];

  // Era el único producto: la venta se queda sin contenido, se elimina completa.
  if (venta.items.length <= 1) {
    await db.carteraVenta.delete({ where: { id: venta.id } });
    return { devolver, ventaEliminada: true, ventaId: venta.id };
  }

  const restantes = venta.items.filter((i) => i.id !== itemId);
  const total = restantes.reduce(
    (s, i) => s + Number(i.precio) * i.cantidad,
    0
  );

  await db.$transaction([
    db.carteraVentaItem.delete({ where: { id: itemId } }),
    db.carteraVenta.update({ where: { id: venta.id }, data: { total } }),
  ]);

  return { devolver, ventaEliminada: false, ventaId: venta.id };
}

/** Eliminar una persona y todo su historial (ventas, ítems y abonos en cascada). */
export async function eliminarCliente(clienteId: string) {
  return db.carteraCliente.delete({ where: { id: clienteId } });
}

/**
 * Búsqueda de productos del catálogo para armar la venta (tolerante a apodos).
 * Incluye los productos en **borrador**: se fía mercancía que todavía no está
 * publicada en la tienda (p. ej. el Club de Nuit Lion Heart).
 */
// El buscador de la cartera lee del Excel (fuente de la verdad del inventario),
// no de Neon. Caché corto para que escribir sea ágil sin golpear el Apps Script
// en cada tecla.
let invCache: { items: InventarioItem[]; exp: number } | null = null;
const INV_TTL = 60 * 1000;

async function inventarioParaBuscar(): Promise<InventarioItem[]> {
  if (invCache && invCache.exp > Date.now()) return invCache.items;
  const { items } = await getInventario();
  invCache = { items, exp: Date.now() + INV_TTL };
  return items;
}

/** Invalida el caché del buscador (p. ej. tras agregar un producto). */
export function invalidarCacheInventario() {
  invCache = null;
}

export async function buscarProductosCatalogo(q: string) {
  const termino = q.trim();
  if (termino.length < 2) return [];

  // Cada palabra debe aparecer en el nombre: "mallow madness" encuentra
  // "Lattafa Mallow Madness"; "mantequilla" encuentra las de Victoria's Secret.
  const palabras = normalizar(termino).split(/\s+/).slice(0, 4);

  const items = await inventarioParaBuscar();
  const encontrados = items.filter((it) => {
    const n = normalizar(it.nombre);
    return palabras.every((p) => n.includes(p));
  });

  // En stock primero, luego por nombre.
  encontrados.sort((a, b) => {
    const sa = a.stock > 0 ? 0 : 1;
    const sb = b.stock > 0 ? 0 : 1;
    if (sa !== sb) return sa - sb;
    return a.nombre.localeCompare(b.nombre);
  });

  return encontrados.slice(0, 20).map((it) => ({
    productId: null,
    variantId: null,
    nombre: it.nombre,
    presentacion: it.stock > 0 ? `${it.stock} en stock` : "Agotado",
    precio: it.precioDetal,
    stock: it.stock,
    borrador: false,
  }));
}

/** Un perfume vendido, para el historial (una fila por ítem de venta). */
export interface VendidoHistorial {
  id: string;
  ventaId: string;
  descripcion: string;
  cantidad: number;
  total: number; // precio × cantidad
  fecha: string; // ISO: momento de la venta
  // Ya formateadas en el servidor (hora Colombia). El navegador no formatea
  // fechas: Node y el navegador escriben "p. m." con espacios distintos y React
  // marca el texto como distinto al hidratar.
  /** "7:35 p. m.", o null si la fecha se puso a mano y no hay hora real. */
  hora: string | null;
  /** "2026-09-28" (agrupar por día) y "lunes, 28 de septiembre de 2026". */
  diaClave: string;
  diaLargo: string;
  /** "2026-09" (filtrar por mes) y "septiembre de 2026". */
  mesClave: string;
  mesLargo: string;
  tipo: "CREDITO" | "CONTADO";
  anulada: boolean;
  clienteId: string;
  clienteNombre: string;
  /** Lo que falta por cobrar de este perfume (0 si ya está pagado o anulado). */
  pendiente: number;
}

/**
 * Cuánto falta por cobrar de cada producto vendido, por persona:
 *
 * 1. El abono ligado a una venta (el automático de las de contado) paga esa venta.
 * 2. El resto de abonos paga las compras más viejas primero.
 * 3. Dentro de una venta, lo pagado cubre sus productos en orden.
 *
 * Así "por cobrar" se puede sumar sobre cualquier filtro (un mes, un perfume, una
 * persona) y, sin filtro, da exactamente lo que deben todas las personas.
 */
function pendientesPorItem(
  ventas: {
    id: string;
    clienteId: string;
    fecha: Date;
    createdAt: Date;
    anulada: boolean;
    items: { id: string; precio: unknown; cantidad: number }[];
  }[],
  abonos: { clienteId: string; ventaId: string | null; monto: unknown }[]
): Map<string, number> {
  const pendienteVenta = new Map<string, number>();
  for (const v of ventas) {
    if (v.anulada) continue;
    pendienteVenta.set(
      v.id,
      v.items.reduce((s, i) => s + Math.round(Number(i.precio) * i.cantidad), 0)
    );
  }

  // 1. Abonos ligados a su venta; lo que sobre va a la bolsa de la persona.
  const bolsa = new Map<string, number>();
  for (const a of abonos) {
    let monto = Math.round(Number(a.monto));
    if (a.ventaId && pendienteVenta.has(a.ventaId)) {
      const aplica = Math.min(monto, pendienteVenta.get(a.ventaId)!);
      pendienteVenta.set(a.ventaId, pendienteVenta.get(a.ventaId)! - aplica);
      monto -= aplica;
    }
    bolsa.set(a.clienteId, (bolsa.get(a.clienteId) ?? 0) + monto);
  }

  // 2. La bolsa paga las compras más viejas primero.
  const ordenadas = ventas
    .filter((v) => !v.anulada)
    .sort(
      (a, b) =>
        a.fecha.getTime() - b.fecha.getTime() ||
        a.createdAt.getTime() - b.createdAt.getTime()
    );
  for (const v of ordenadas) {
    const disponible = bolsa.get(v.clienteId) ?? 0;
    if (disponible <= 0) continue;
    const aplica = Math.min(disponible, pendienteVenta.get(v.id)!);
    pendienteVenta.set(v.id, pendienteVenta.get(v.id)! - aplica);
    bolsa.set(v.clienteId, disponible - aplica);
  }

  // 3. Lo pagado de cada venta cubre sus productos en orden; el resto queda pendiente.
  const porItem = new Map<string, number>();
  for (const v of ventas) {
    const items = [...v.items].sort((a, b) => a.id.localeCompare(b.id));
    if (v.anulada) {
      for (const i of items) porItem.set(i.id, 0);
      continue;
    }
    const totalVenta = items.reduce((s, i) => s + Math.round(Number(i.precio) * i.cantidad), 0);
    let pagado = totalVenta - pendienteVenta.get(v.id)!;
    for (const i of items) {
      const t = Math.round(Number(i.precio) * i.cantidad);
      const cubre = Math.min(pagado, t);
      porItem.set(i.id, t - cubre);
      pagado -= cubre;
    }
  }
  return porItem;
}

/**
 * Historial de perfumes vendidos, del más reciente al más viejo. Incluye las
 * ventas anuladas (marcadas) para no perder la trazabilidad; las eliminadas ya
 * no existen.
 */
export async function getHistorialVendidos(): Promise<VendidoHistorial[]> {
  const [ventas, abonos] = await Promise.all([
    db.carteraVenta.findMany({
      include: {
        items: true,
        cliente: { select: { id: true, nombre: true } },
      },
    }),
    db.carteraAbono.findMany({
      select: { clienteId: true, ventaId: true, monto: true },
    }),
  ]);
  const pendientes = pendientesPorItem(ventas, abonos);

  // Una fila por producto, del más reciente al más viejo.
  const items = ventas
    .flatMap((venta) =>
      [...venta.items]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((item) => ({ ...item, venta }))
    )
    .sort((a, b) => b.venta.fecha.getTime() - a.venta.fecha.getTime());

  return items.map((i) => {
    const f = i.venta.fecha;
    const diaClave = aInputDate(f);
    // Si la fecha se registró al momento (hoy: siempre), la hora es real. Si
    // algún día se carga una venta con fecha atrasada, no se inventa una hora.
    const horaReal = Math.abs(f.getTime() - i.venta.createdAt.getTime()) < 5 * 60_000;
    return {
    id: i.id,
    ventaId: i.venta.id,
    descripcion: i.descripcion,
    cantidad: i.cantidad,
    total: Math.round(Number(i.precio) * i.cantidad),
    fecha: f.toISOString(),
    hora: horaReal ? formatHora(f) : null,
    diaClave,
    diaLargo: formatDiaLargo(f),
    mesClave: diaClave.slice(0, 7),
    mesLargo: formatMes(f),
    tipo: i.venta.tipo,
    anulada: i.venta.anulada,
    clienteId: i.venta.cliente.id,
    clienteNombre: i.venta.cliente.nombre,
    pendiente: pendientes.get(i.id) ?? 0,
    };
  });
}
