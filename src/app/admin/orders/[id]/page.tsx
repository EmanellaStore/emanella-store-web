"use client";
// src/app/admin/orders/[id]/page.tsx

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Save, X, Trash2, Plus } from "lucide-react";

interface Variant {
  id: string;
  sku: string;
  attributeName: string;
  attributeValue: string;
  price: string;
  stock: number;
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
}

interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  variant: Variant;
}

interface OrderEvent {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  city: string | null;
  notes: string | null;
}

interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: string;
  notes: string | null;
  trackingCode?: string | null;
  trackingCarrier?: string | null;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
  events: OrderEvent[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  variants: Variant[];
}

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  ENVIADO: "bg-purple-100 text-purple-700",
  ENTREGADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItems, setEditingItems] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [newItems, setNewItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");

  // useCallback: loadOrder no se recrea en cada render
  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Error cargando pedido");
      const data = await res.json();
      setOrder(data.order);
      setCustomerForm({
        name: data.order.customer.name,
        phone: data.order.customer.phone,
        address: data.order.customer.address ?? "",
        city: data.order.customer.city ?? "",
        notes: data.order.customer.notes ?? "",
      });
      setNewItems([...data.order.items]);
    } catch (err) {
      console.error("Error loading order:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]); // solo depende de orderId, que no cambia

  // Se ejecuta solo cuando orderId cambia (una vez al montar)
  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const startEditItems = async () => {
    await loadProducts();
    setEditingItems(true);
  };

  const addNewItem = () => {
    if (!selectedVariantId) return;
    const product = products.find((p) =>
      p.variants.some((v) => v.id === selectedVariantId)
    );
    const variant = product?.variants.find((v) => v.id === selectedVariantId);
    if (!product || !variant) return;

    const newItem: OrderItem = {
      id: `new-${Date.now()}`,
      variantId: variant.id,
      quantity: newQuantity,
      unitPrice: variant.price,
      variant: {
        ...variant,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
        },
      },
    };

    setNewItems((prev) => [
      ...prev.filter((i) => i.variantId !== selectedVariantId),
      newItem,
    ]);
    setSelectedVariantId("");
  };

  const removeItem = (variantId: string) => {
    setNewItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateItemQuantity = (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    setNewItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const saveItems = async () => {
    if (!order) return;
    try {
      const items = newItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice:
          typeof item.unitPrice === "string"
            ? parseFloat(item.unitPrice)
            : item.unitPrice,
      }));

      const res = await fetch(`/api/admin/orders/${order.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateItems",
          orderId: order.id,
          items,
        }),
      });

      if (!res.ok) throw new Error("Failed to save items");
      setEditingItems(false);
      await loadOrder();
    } catch (err) {
      console.error("Error saving items:", err);
      alert("Error al guardar los items");
    }
  };

  const saveCustomer = async () => {
    if (!order) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateCustomer",
          orderId: order.id,
          customerData: customerForm,
        }),
      });

      if (!res.ok) throw new Error("Failed to save customer");
      setEditingCustomer(false);
      await loadOrder();
    } catch (err) {
      console.error("Error saving customer:", err);
      alert("Error al guardar los datos del cliente");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!order) return;

    // Si pasa a ENVIADO, pedir código de guía antes
    if (status === "ENVIADO") {
      setShowShippingModal(true);
      return;
    }

    await executeStatusChange(status);
  };

  const executeStatusChange = async (status: string, extra?: { trackingCode?: string; trackingCarrier?: string }) => {
    if (!order) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStatus",
          orderId: order.id,
          status,
          ...extra,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setOrder((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error al actualizar el estado");
    }
  };

  const confirmShipping = async () => {
    if (!trackingCode.trim()) {
      alert("Ingresa el código de guía");
      return;
    }
    await executeStatusChange("ENVIADO", { trackingCode, trackingCarrier });
    setShowShippingModal(false);
    setTrackingCode("");
    setTrackingCarrier("");
  };

  const calculateTotal = () =>
    newItems.reduce((sum, item) => {
      const price =
        typeof item.unitPrice === "string"
          ? parseFloat(item.unitPrice)
          : item.unitPrice;
      return sum + price * item.quantity;
    }, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-cream/50 rounded"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-serif text-2xl text-cacao">
            Cargando pedido...
          </h1>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-cream/50 rounded"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-serif text-2xl text-cacao">
            Pedido no encontrado
          </h1>
        </div>
      </div>
    );
  }

  const isEditable = order.status === "PENDIENTE";

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-cream/50 rounded transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl text-cacao">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-warm-gray">
            Creado: {new Date(order.createdAt).toLocaleString("es-CO")}
          </p>
        </div>
        <span
          className={`ml-auto px-3 py-1 text-xs font-bold rounded ${statusColors[order.status] ?? ""
            }`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <div className="bg-beige border border-blush/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl text-cacao">Productos</h2>
              {!editingItems ? (
                <button
                  onClick={startEditItems}
                  disabled={!isEditable}
                  className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${isEditable
                    ? "bg-cacao text-cream hover:bg-gold"
                    : "bg-warm-gray/30 text-warm-gray cursor-not-allowed"
                    }`}
                >
                  <Pencil size={14} />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewItems([...(order?.items ?? [])]);
                      setEditingItems(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1 text-xs border border-warm-gray hover:border-cacao transition-colors"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={saveItems}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-warm-black text-on-dark hover:bg-gold-dark transition-colors"
                  >
                    <Save size={14} />
                    Guardar
                  </button>
                </div>
              )}
            </div>

            {editingItems && (
              <div className="mb-4 p-4 bg-cream/50 border border-blush/20">
                <p className="text-xs text-warm-gray mb-3">Agregar producto:</p>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setSelectedVariantId("");
                      }}
                      className="w-full border border-blush/50 p-2 text-sm bg-beige"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full border border-blush/50 p-2 text-sm bg-beige"
                      disabled={!selectedProductId}
                    >
                      <option value="">Seleccionar variante...</option>
                      {products
                        .find((p) => p.id === selectedProductId)
                        ?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.attributeValue} — $
                            {Number(v.price).toLocaleString("es-CO")}
                          </option>
                        ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) =>
                      setNewQuantity(parseInt(e.target.value) || 1)
                    }
                    className="w-20 border border-blush/50 p-2 text-sm bg-beige"
                  />
                  <button
                    onClick={addNewItem}
                    disabled={!selectedVariantId}
                    className="px-4 py-2 bg-warm-black text-on-dark text-sm hover:bg-gold-dark disabled:bg-warm-gray transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {newItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-cream/30 border border-blush/10"
                >
                  <div className="flex-1">
                    <p className="font-sans text-sm font-bold text-cacao">
                      {item.variant.product.name}
                    </p>
                    <p className="text-xs text-warm-gray">
                      {item.variant.attributeName}: {item.variant.attributeValue}{" "}
                      | SKU: {item.variant.sku}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingItems ? (
                      <>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.variantId, item.quantity - 1)
                          }
                          className="w-8 h-8 border border-blush/50 hover:bg-blush/20"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.variantId, item.quantity + 1)
                          }
                          className="w-8 h-8 border border-blush/50 hover:bg-blush/20"
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <span className="text-sm">x{item.quantity}</span>
                    )}
                  </div>
                  <div className="w-24 text-right">
                    <p className="font-sans text-sm font-bold text-cacao">
                      $
                      {(
                        Number(item.unitPrice) * item.quantity
                      ).toLocaleString("es-CO")}
                    </p>
                    <p className="text-xs text-warm-gray">
                      ${Number(item.unitPrice).toLocaleString("es-CO")} c/u
                    </p>
                  </div>
                  {editingItems && (
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-blush/20 flex justify-between items-center">
              <span className="font-sans text-sm text-warm-gray">Total</span>
              <span className="font-serif text-xl text-cacao">
                ${calculateTotal().toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Cambio de estado */}
          <div className="bg-beige border border-blush/20 p-6">
            <h2 className="font-serif text-xl text-cacao mb-4">
              Estado del Pedido
            </h2>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "PENDIENTE",
                  "CONFIRMADO",
                  "ENVIADO",
                  "ENTREGADO",
                  "CANCELADO",
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={order.status === status}
                  className={`px-4 py-2 text-xs font-bold rounded transition-colors ${order.status === status
                    ? statusColors[status]
                    : "bg-cream/50 text-warm-gray hover:bg-blush/20"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Historial */}
          <div className="bg-beige border border-blush/20 p-6">
            <h2 className="font-serif text-xl text-cacao mb-4">Historial</h2>
            <div className="space-y-3">
              {order.events.map((event) => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <div className="w-32 flex-shrink-0 text-xs text-warm-gray">
                    {new Date(event.createdAt).toLocaleString("es-CO")}
                  </div>
                  <div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${statusColors[event.status] ?? ""
                        }`}
                    >
                      {event.status}
                    </span>
                    {event.note && (
                      <p className="text-warm-gray mt-1">{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-beige border border-blush/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl text-cacao">Cliente</h2>
              {!editingCustomer ? (
                <button
                  onClick={() => setEditingCustomer(true)}
                  disabled={!isEditable}
                  className={`p-2 hover:bg-cream/50 ${!isEditable ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <Pencil size={16} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCustomerForm({
                        name: order.customer.name,
                        phone: order.customer.phone,
                        address: order.customer.address ?? "",
                        city: order.customer.city ?? "",
                        notes: order.customer.notes ?? "",
                      });
                      setEditingCustomer(false);
                    }}
                    className="p-2 hover:bg-cream/50"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={saveCustomer}
                    className="p-2 hover:bg-cream/50 text-gold"
                  >
                    <Save size={16} />
                  </button>
                </div>
              )}
            </div>

            {editingCustomer ? (
              <div className="space-y-3">
                {[
                  { label: "Nombre", key: "name", type: "text" },
                  { label: "WhatsApp", key: "phone", type: "text" },
                  { label: "Ciudad", key: "city", type: "text" },
                  { label: "Dirección", key: "address", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs text-warm-gray mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={customerForm[key as keyof typeof customerForm]}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full border border-blush/50 p-2 text-sm bg-beige"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-warm-gray mb-1">
                    Notas
                  </label>
                  <textarea
                    value={customerForm.notes}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full border border-blush/50 p-2 text-sm bg-beige h-20"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-warm-gray">Nombre:</span>{" "}
                  <span className="font-bold text-cacao">
                    {order.customer.name}
                  </span>
                </p>
                <p>
                  <span className="text-warm-gray">WhatsApp:</span>{" "}
                  <span className="text-cacao">{order.customer.phone}</span>
                </p>
                <p>
                  <span className="text-warm-gray">Ciudad:</span>{" "}
                  <span className="text-cacao">
                    {order.customer.city ?? "-"}
                  </span>
                </p>
                <p>
                  <span className="text-warm-gray">Dirección:</span>{" "}
                  <span className="text-cacao">
                    {order.customer.address ?? "-"}
                  </span>
                </p>
                {order.customer.notes && (
                  <p>
                    <span className="text-warm-gray">Notas:</span>{" "}
                    <span className="text-cacao">{order.customer.notes}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Info del pedido */}
          <div className="bg-beige border border-blush/20 p-6">
            <h2 className="font-serif text-xl text-cacao mb-4">Información</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-warm-gray">Método de pago:</span>{" "}
                <span className="text-cacao">{order.paymentMethod}</span>
              </p>
              {order.notes && (
                <p>
                  <span className="text-warm-gray">Notas:</span>{" "}
                  <span className="text-cacao">{order.notes}</span>
                </p>
              )}
            </div>
          </div>
          {(order.status === "ENVIADO" || order.status === "ENTREGADO") && (
            <div className="bg-beige border border-blush/20 p-6">
              <h2 className="font-serif text-xl text-cacao mb-4">Envío</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-warm-gray">Transportadora:</span>{" "}
                  <span className="text-cacao">{(order as any).trackingCarrier || "-"}</span>
                </p>
                <p>
                  <span className="text-warm-gray">Guía:</span>{" "}
                  <span className="text-cacao font-mono">{(order as any).trackingCode || "-"}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal: Ingresar guía de envío */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-beige p-6 max-w-md w-full">
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
                  className="w-full border border-blush/50 p-2 text-sm bg-beige"
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
                  className="w-full border border-blush/50 p-2 text-sm bg-beige"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowShippingModal(false);
                  setTrackingCode("");
                  setTrackingCarrier("");
                }}
                className="flex-1 px-4 py-2 border border-warm-gray text-warm-gray hover:bg-cream/50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmShipping}
                className="flex-1 px-4 py-2 bg-warm-black text-on-dark hover:bg-gold-dark text-sm"
              >
                Marcar como enviado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}