//src/app/gracias/page.tsx

import Navbar from "../components/shop/Navbar";
import Link from "next/link";

export default async function SuccessPage({ searchParams, }: {
    searchParams: Promise<{ orderId?: string }>;
}) {
    const { orderId } = await searchParams;
    return (  
        <main className="min-h-screen bg-cream">  
          <Navbar />  
          <section className="pt-40 pb-20 px-4 text-center max-w-2xl mx-auto">  
            <h1 className="font-serif text-5xl text-cacao mb-4">¡Gracias por tu pedido!</h1>  
            <p className="font-sans text-warm-gray mb-6 leading-relaxed">  
              Hemos recibido tu solicitud. Te contactaremos por WhatsApp para confirmar.  
            </p>  
            {orderId ? (  
              <p className="font-sans text-xs tracking-widest uppercase text-gold mb-10">  
                Código de pedido: {orderId}  
              </p>  
            ) : null}  
      
            <Link  
              href="/catalogo"  
              className="inline-block bg-gold text-cream px-10 py-4 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors"  
            >  
              Volver a la tienda  
            </Link>  
          </section>  
        </main>  
      );  
    }