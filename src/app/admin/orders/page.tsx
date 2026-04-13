import db from "@/lib/db";
import { updateOrderStatus, notifyShipping } from "./actions";
import { OrderStatus } from "@prisma/client";

const statusColors: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    CONFIRMADO: "bg-blue-100 text-blue-700",
    ENVIADO: "bg-purple-100 text-purple-700",
    ENTREGADO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
};

export default async function AdminOrdersPage() {
    const orders = await db.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="min-h-screen bg-cream p-8">
            <div className="max-w-7xl mx-auto pt-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="font-serif text-3xl text-cacao">Pedidos</h1>
                        <p className="font-sans text-xs text-warm-gray mt-1">
                            {orders.length} pedidos en total
                        </p>
                    </div>
                    <a
                        href="/catalogo"
                        className="font-sans text-xs text-gold hover:underline tracking-widest uppercase"
                    >
                        Ver Tienda →
                    </a>
                </div>

                {/* Stats rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {(["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO"] as OrderStatus[]).map((s) => (
                        <div key={s} className="bg-white border border-blush/20 p-4">
                            <p className="font-sans text-xs text-warm-gray uppercase tracking-widest">{s}</p>
                            <p className="font-serif text-2xl text-cacao mt-1">
                                {orders.filter((o) => o.status === s).length}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Tabla */}
                <div className="bg-white border border-blush/20 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-cacao text-cream text-[10px] uppercase tracking-widest">
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Ciudad</th>
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
                                    <td className="p-4 text-xs text-warm-gray">
                                        {new Date(order.createdAt).toLocaleDateString("es-CO")}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-sans font-bold text-cacao text-sm">
                                            {order.customer.name}
                                        </div>
                                        <div className="text-xs text-warm-gray">{order.customer.phone}</div>
                                    </td>
                                    <td className="p-4 text-xs text-cacao">{order.customer.city}</td>
                                    <td className="p-4 font-bold text-cacao">
                                        ${Number(order.totalAmount).toLocaleString("es-CO")}
                                    </td>
                                    <td className="p-4 text-xs uppercase text-warm-gray">
                                        {order.paymentMethod}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded ${statusColors[order.status] ?? ""}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {order.status === "PENDIENTE" && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateOrderStatus(order.id, OrderStatus.CONFIRMADO);
                                                }}>
                                                    <button className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 hover:bg-blue-200 w-full">
                                                        ✓ Confirmar
                                                    </button>
                                                </form>
                                            )}
                                            {order.status === "CONFIRMADO" && (
                                                <form action={async () => {
                                                    "use server";
                                                    await notifyShipping(order.id);
                                                }}>
                                                    <button className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 hover:bg-purple-200 w-full">
                                                        🚚 Marcar Enviado
                                                    </button>
                                                </form>
                                            )}
                                            {order.status === "ENVIADO" && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateOrderStatus(order.id, OrderStatus.ENTREGADO);
                                                }}>
                                                    <button className="text-[10px] bg-green-100 text-green-700 px-2 py-1 hover:bg-green-200 w-full">
                                                        ✅ Entregado
                                                    </button>
                                                </form>
                                            )}
                                            {order.status !== "CANCELADO" && order.status !== "ENTREGADO" && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateOrderStatus(order.id, OrderStatus.CANCELADO);
                                                }}>
                                                    <button className="text-[10px] bg-red-100 text-red-700 px-2 py-1 hover:bg-red-200 w-full">
                                                        ✕ Cancelar
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}