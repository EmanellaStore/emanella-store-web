// src/app/resena/[orderId]/page.tsx
'use client';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/components/shop';

export default function ReviewPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const searchParams = useSearchParams();
  const customerId = searchParams.get('c') || '';
  const productId = searchParams.get('p') || undefined;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!rating) { setError('Selecciona una calificación'); return; }
    if (!orderId) { setError('Link inválido, falta orderId'); return; }
    if (!customerId) { setError('Link inválido, falta customerId'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerId,
          productId: productId || null,
          rating,
          comment: comment || null,
          photoUrl: photoUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error enviando reseña'); return; }
      if (data.coupon) setCouponCode(data.coupon.code);
      setSubmitted(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-cream">
        <Navbar />
        <section className="pt-40 pb-20 px-4 text-center max-w-lg mx-auto">
          <h1 className="font-serif text-4xl text-cacao mb-4">¡Gracias por tu reseña!</h1>
          <p className="text-warm-gray mb-6">Tu opinión nos ayuda a mejorar y a otros clientes a elegir mejor.</p>
          {couponCode && (
            <div className="bg-gold/10 border border-gold p-6 mt-4">
              <p className="text-xs uppercase tracking-widest text-cacao mb-2">🎁 Tu cupón por compartir foto</p>
              <p className="font-serif text-3xl text-gold font-bold">{couponCode}</p>
              <p className="text-xs text-warm-gray mt-2">15% OFF · Válido 30 días · Mínimo $80.000</p>
            </div>
          )}
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <section className="pt-40 pb-20 px-4 max-w-lg mx-auto">
        <h1 className="font-serif text-4xl text-cacao mb-2 text-center">¿Cómo fue tu experiencia?</h1>
        <p className="text-center text-warm-gray text-sm mb-10">Tu opinión es muy valiosa para nosotros</p>

        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-4xl transition-transform hover:scale-110 ${star <= rating ? 'text-gold' : 'text-blush/40'}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia (opcional)..."
          className="w-full border border-blush/50 bg-white/50 p-3 outline-none focus:border-gold h-28 mb-4"
        />

        <div className="bg-gold/5 border border-gold/30 p-4 mb-6">
          <p className="text-xs uppercase tracking-widest text-cacao mb-2">
            📸 ¿Tienes foto con el producto? ¡Gana 15% OFF!
          </p>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="Pega el link de tu foto (Instagram, Drive, etc.)"
            className="w-full border border-blush/50 bg-white p-2 text-sm outline-none focus:border-gold"
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={submit}
          disabled={loading || !rating}
          className="w-full bg-gold text-cream py-4 text-xs uppercase tracking-[0.3em] hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Reseña'}
        </button>
      </section>
      <Footer />
    </main>
  );
}