import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { Navbar, Footer } from '@/components/shop';

const STATUS_STEPS = [
  { key: 'PENDIENTE', label: 'Recibido', icon: '📝' },
  { key: 'CONFIRMADO', label: 'Confirmado', icon: '✅' },
  { key: 'ENVIADO', label: 'Enviado', icon: '📦' },
  { key: 'ENTREGADO', label: 'Entregado', icon: '🎉' },
];

export default async function TrackPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
  });

  if (!order) notFound();

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'CANCELADO';

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase mb-2">Tu pedido</p>
          <h1 className="font-serif text-4xl text-cacao font-light">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="font-sans text-sm text-warm-gray mt-2">
            Realizado el {new Date(order.createdAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}
          </p>
        </div>

        {/* Status tracker */}
        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 p-6 text-center mb-10">
            <p className="font-serif text-2xl text-red-800">Pedido cancelado</p>
          </div>
        ) : (
          <div className="flex justify-between items-start mb-12 relative">
            <div className="absolute top-6 left-10 right-10 h-0.5 bg-blush/30" />
            <div
              className="absolute top-6 left-10 h-0.5 bg-gold transition-all"
              style={{ width: `calc(${(currentIdx / (STATUS_STEPS.length - 1)) * 100}% - ${currentIdx * 2}rem)` }}
            />
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center relative z-10 w-1/4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    i <= currentIdx ? 'bg-gold text-cream' : 'bg-blush/30 text-warm-gray'
                  }`}
                >
                  {step.icon}
                </div>
                <p className={`mt-3 text-xs uppercase tracking-wider ${i <= currentIdx ? 'text-cacao font-medium' : 'text-warm-gray'}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tracking info */}
        {order.trackingCode && (
          <div className="bg-white/60 border border-gold/30 p-6 mb-10">
            <p className="font-sans text-xs uppercase tracking-widest text-warm-gray mb-2">Guía de envío</p>
            <p className="font-serif text-2xl text-cacao">{order.trackingCode}</p>
            {order.trackingCarrier && (
              <p className="font-sans text-sm text-warm-gray mt-1">
                Transportadora: {order.trackingCarrier}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="bg-white/50 border border-blush/20 p-8">
          <h2 className="font-serif text-xl text-cacao mb-6">Productos</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between font-sans text-sm border-b border-blush/20 pb-3">
                <div>
                  <p className="text-cacao">{item.variant.product.name}</p>
                  <p className="text-xs text-warm-gray">
                    {item.variant.attributeValue} × {item.quantity}
                  </p>
                </div>
                <p className="text-cacao font-medium">
                  ${(Number(item.unitPrice) * item.quantity).toLocaleString('es-CO')}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t border-blush/30 font-sans font-medium">
            <span className="text-cacao">Total</span>
            <span className="text-cacao">${Number(order.totalAmount).toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="text-center mt-10 font-sans text-sm text-warm-gray">
          ¿Necesitas ayuda? Escríbenos por WhatsApp y te ayudamos con tu pedido 💬
        </div>
      </section>
      <Footer />
    </main>
  );
}