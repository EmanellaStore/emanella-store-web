// src/services/cartera.service.ts — lógica del módulo de cartera (fiados y abonos).
// Saldo de una persona = Σ ventas no anuladas − Σ abonos.
// Las ventas de CONTADO nacen con un abono automático por el total, así el saldo
// queda en cero y el historial conserva el movimiento completo.
import db from "@/lib/db";
import { getInventario } from "./inventario.service";
import { normalizar, type InventarioItem } from "@/lib/inventario";

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

  const [ventas, abonos, pendientes] = await Promise.all([
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
      orderBy: { fechaPago: "asc" },
    }),
  ]);

  const ventasPorCliente = new Map(ventas.map((v) => [v.clienteId, Number(v._sum.total ?? 0)]));
  const abonosPorCliente = new Map(abonos.map((a) => [a.clienteId, Number(a._sum.monto ?? 0)]));
  const vencimientoPorCliente = new Map<string, Date>();
  for (const p of pendientes) {
    if (p.fechaPago && !vencimientoPorCliente.has(p.clienteId)) {
      vencimientoPorCliente.set(p.clienteId, p.fechaPago);
    }
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return clientes
    .map((c) => {
      const totalVentas = ventasPorCliente.get(c.id) ?? 0;
      const totalAbonos = abonosPorCliente.get(c.id) ?? 0;
      const saldo = Math.round(totalVentas - totalAbonos);
      const proximoVencimiento = vencimientoPorCliente.get(c.id) ?? null;
      return {
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
        totalVentas,
        totalAbonos,
        saldo,
        proximoVencimiento,
        vencido: saldo > 0 && !!proximoVencimiento && proximoVencimiento < hoy,
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
