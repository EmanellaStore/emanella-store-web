"use client";
// src/app/admin/orders/page.tsx

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  ENVIADO: "bg-purple-100 text-purple-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

type OrderStatusType = "PENDIENTE" | "CONFIRMADO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";

interface OrderWithCustomer {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: string | number;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    city: string | null;
  };
  _count: { items: number };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal tracking
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Error cargando pedidos");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Cambio de estado normal (usa endpoint /[id]/action que sí soporta tracking)
  const executeStatusChange = async (
    orderId: string,
    newStatus: OrderStatusType,
    extra?: { trackingCode?: string; trackingCarrier?: string }
  ) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStatus",
          orderId,
          status: newStatus,
          ...extra,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error al actualizar el estado");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatusType) => {
    // Si pasa a ENVIADO → abrir modal para capturar guía
    if (newStatus === "ENVIADO") {
      setShippingOrderId(orderId);
      return;
    }
    executeStatusChange(orderId, newStatus);
  };

  const confirmShipping = async () => {
    if (!shippingOrderId) return;
    if (!trackingCode.trim()) {
      alert("Ingresa el código de guía");
      return;
    }
    await executeStatusChange(shippingOrderId, "ENVIADO", {
      trackingCode: trackingCode.trim(),
      trackingCarrier: trackingCarrier.trim() || undefined,
    });
    setShippingOrderId(null);
    setTrackingCode("");
    setTrackingCarrier("");
  };

  const cancelShipping = () => {
    setShippingOrderId(null);
    setTrackingCode("");
    setTrackingCarrier("");
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-cacao">Cargando pedidos...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="font-serif text-3xl text-cacao mb-4">Pedidos</h1>
        <p className="text-red-500 font-sans text-sm">{error}</p>
        <button
          onClick={loadOrders}
          className="mt-4 px-4 py-2 bg-gold text-cream text-xs uppercase tracking-widest"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl text-cacao">Pedidos</h1>
            <p className="font-sans text-xs text-warm-gray mt-1">
              {orders.length} pedidos en total
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO"] as const).map((s) => (
            <div key={s} className="bg-white border border-blush/20 p-4">
              <p className="font-sans text-xs text-warm-gray uppercase tracking-widest">{s}</p>
              <p className="font-serif text-2xl text-cacao mt-1">
                {orders.filter((o) => o.status === s).length}
              </p>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-blush/20 p-12 text-center">
            <p className="font-serif text-2xl text-cacao mb-2">No hay pedidos todavía</p>
            <p className="font-sans text-sm text-warm-gray">
              Los pedidos aparecerán aquí cuando los clientes realicen compras.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-blush/20 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cacao text-cream text-[10px] uppercase tracking-widest">
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Ciudad</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Pago</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-blush/10 hover:bg-cream/40 transition-colors text-sm"
                  >
                    <td className="p-4">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <div className="text-xs text-warm-gray">
                          {new Date(order.createdAt).toLocaleDateString("es-CO")}
                        </div>
                        <div className="text-[10px] text-gold">#{order.id.slice(0, 8)}</div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block hover:text-gold transition-colors"
                      >
                        <div className="font-sans font-bold text-cacao text-sm">
                          {order.customer.name}
                        </div>
                        <div className="text-xs text-warm-gray">{order.customer.phone}</div>
                      </Link>
                    </td>
                    <td className="p-4 text-xs text-cacao">{order.customer.city ?? "-"}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blush/20 text-xs text-cacao rounded-full">
                        {order._count.items}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-cacao">
                      ${Number(order.totalAmount).toLocaleString("es-CO")}
                    </td>
                    <td className="p-4 text-xs uppercase text-warm-gray">{order.paymentMethod}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded ${
                          statusColors[order.status] ?? ""
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[10px] bg-gold/20 text-gold px-2 py-1 hover:bg-gold/30 text-center"
                        >
                          Ver / Editar
                        </Link>
                        {order.status === "PENDIENTE" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "CONFIRMADO")}
                            disabled={actionLoading === order.id}
                            className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 hover:bg-blue-200 w-full disabled:opacity-50"
                          >
                            {actionLoading === order.id ? "..." : "Confirmar"}
                          </button>
                        )}
                        {order.status === "CONFIRMADO" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "ENVIADO")}
                            disabled={actionLoading === order.id}
                            className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 hover:bg-purple-200 w-full disabled:opacity-50"
                          >
                            {actionLoading === order.id ? "..." : "Marcar Enviado"}
                          </button>
                        )}
                        {order.status === "ENVIADO" && (
                          <button
                            onClick={() => handleStatusChange(order.id, "ENTREGADO")}
                            disabled={actionLoading === order.id}
                            className="text-[10px] bg-green-100 text-green-700 px-2 py-1 hover:bg-green-200 w-full disabled:opacity-50"
                          >
                            {actionLoading === order.id ? "..." : "Entregado"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Ingresar guía de envío */}
      {shippingOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 max-w-md w-full">
            <h3 className="font-serif text-xl text-cacao mb-4">Información de envío</h3>
            <p className="text-xs text-warm-gray mb-4">
              Estos datos se enviarán al cliente por WhatsApp/Telegram.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-warm-gray mb-1">Transportadora</label>
                <select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full border border-blush/50 p-2 text-sm bg-white"
                >
                  <option value="">Selecciona...</option>
                  <option value="Servientrega">Servientrega</option>
                  <option value="Coordinadora">Coordinadora</option>
                  <option value="Interrapidisimo">Interrapidísimo</option>
                  <option value="Envia">Envía</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-warm-gray mb-1">Código de guía</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ej: 1234567890"
                  className="w-full border border-blush/50 p-2 text-sm bg-white"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelShipping}
                disabled={actionLoading === shippingOrderId}
                className="flex-1 px-4 py-2 border border-warm-gray text-warm-gray hover:bg-cream/50 text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmShipping}
                disabled={actionLoading === shippingOrderId}
                className="flex-1 px-4 py-2 bg-gold text-cream hover:bg-gold-dark text-sm disabled:opacity-50"
              >
                {actionLoading === shippingOrderId ? "Enviando..." : "Marcar como enviado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}