// src/services/cartera.service.ts — lógica del módulo de cartera (fiados y abonos).
// Saldo de una persona = Σ ventas no anuladas − Σ abonos.
// Las ventas de CONTADO nacen con un abono automático por el total, así el saldo
// queda en cero y el historial conserva el movimiento completo.
import db from "@/lib/db";

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

/** Anular deja rastro (no borra). Si era de contado, se quita su abono automático. */
export async function anularVenta(ventaId: string) {
  return db.$transaction(async (tx) => {
    const venta = await tx.carteraVenta.findUnique({ where: { id: ventaId } });
    if (!venta) throw new Error("Venta no encontrada");
    if (venta.tipo === "CONTADO") {
      await tx.carteraAbono.deleteMany({ where: { ventaId } });
    }
    return tx.carteraVenta.update({
      where: { id: ventaId },
      data: { anulada: true },
    });
  });
}

export async function eliminarAbono(abonoId: string) {
  return db.carteraAbono.delete({ where: { id: abonoId } });
}

/** Eliminar de verdad una venta (por si se registró por error). Sus ítems se
 *  borran en cascada; los abonos ligados quedan sueltos (ventaId → null). */
export async function eliminarVenta(ventaId: string) {
  return db.carteraVenta.delete({ where: { id: ventaId } });
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
export async function buscarProductosCatalogo(q: string) {
  const termino = q.trim();
  if (termino.length < 2) return [];

  // Cada palabra debe aparecer en el nombre: "mallow madness" encuentra
  // "Lattafa Mallow Madness"; "mantequilla" encuentra las de Victoria's Secret.
  const palabras = termino.split(/\s+/).slice(0, 4);

  const productos = await db.product.findMany({
    where: {
      AND: palabras.map((p) => ({
        name: { contains: p, mode: "insensitive" as const },
      })),
    },
    include: {
      variants: { orderBy: { price: "asc" } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    take: 12,
  });

  return productos.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      variantId: v.id,
      nombre: p.name,
      presentacion: v.attributeValue,
      precio: Number(v.price),
      imagen: p.images[0]?.imageUrl ?? null,
      borrador: !p.isActive,
    }))
  );
}
