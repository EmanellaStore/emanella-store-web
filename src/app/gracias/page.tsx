import { Navbar, Footer } from "@/components/shop";
import Link from "next/link";
import db from "@/lib/db";
import PurchaseTracker from "./PurchaseTracker";

export default async function SuccessPage({ searchParams, }: {
    searchParams: Promise<{ orderId?: string }>;
}) {
    const { orderId } = await searchParams;

    let orderDetails = null;
    if (orderId) {
        try {
            const order = await db.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                },
            });

            if (order) {
                orderDetails = {
                    orderId: order.id,
                    totalAmount: Number(order.totalAmount),
                    shippingAmount: Number(order.shippingAmount),
                    discountAmount: Number(order.discountAmount),
                    coupon: order.appliedCouponCode || undefined,
                    items: order.items.map((i) => ({
                        id: i.variant.product.id,
                        name: i.variant.product.name,
                        price: Number(i.unitPrice),
                        quantity: i.quantity,
                        category: i.variant.product.category,
                    })),
                };
            }
        } catch (error) {
            console.error("Error fetching order for tracking:", error);
        }
    }

    return (  
        <main className="min-h-screen bg-cream">  
          <Navbar />  
          <PurchaseTracker order={orderDetails} />
          
          <section className="pt-40 pb-20 px-4 text-center max-w-2xl mx-auto">  
            <h1 className="font-serif text-5xl text-cacao mb-4">¡Gracias por tu pedido!</h1>  
            <p className="font-sans text-warm-gray mb-6 leading-relaxed">  
              Hemos recibido tu solicitud. Te contactaremos por WhatsApp para confirmar.  
            </p>  
            {orderId ? (  
              <p className="font-sans text-xs tracking-widest uppercase text-gold mb-10">  
                Código de pedido: {orderId.slice(0, 8)}  
              </p>  
            ) : null}  
      
            <Link  
              href="/catalogo"  
              className="inline-block bg-warm-black text-on-dark px-10 py-4 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors"  
            >  
              Volver a la tienda  
            </Link>  
          </section>  
          <Footer />
        </main>  
      );  
    }