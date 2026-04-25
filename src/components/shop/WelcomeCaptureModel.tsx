// src/components/shop/WelcomeCaptureModal.tsx
'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

export default function WelcomeCaptureModal() {
  const { items, phone, setContact } = useCartStore();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    const dismissed = localStorage.getItem('welcome_dismissed');
    if (!dismissed && !phone && items.length >= 2) {
      setShow(true);
    }
  }, [items.length, phone]);

  const submit = async () => {
    if (!phoneInput.match(/^3\d{9}$/)) {
      alert('Teléfono válido: 10 dígitos empezando en 3');
      return;
    }
    
    // crea/actualiza customer + guarda en store
    const res = await fetch('/api/customers/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phoneInput }),
    });
    const data = await res.json();
    setContact({ phone: phoneInput, customerId: data.customer.id });
    localStorage.setItem('welcome_dismissed', '1');
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem('welcome_dismissed', '1');
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-6">
        <h3 className="font-serif text-2xl text-cacao">🎁 10% OFF de bienvenida</h3>
        <p className="text-sm text-warm-gray mt-2">
          Déjanos tu WhatsApp y te enviamos un cupón exclusivo (válido 24h).
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full border border-blush/50 p-2 mt-4"
        />
        <input
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
          placeholder="WhatsApp (300xxxxxxx)"
          maxLength={10}
          className="w-full border border-blush/50 p-2 mt-2"
        />
        <div className="flex gap-2 mt-4">
          <button onClick={dismiss} className="flex-1 py-2 text-sm text-warm-gray">
            Ahora no
          </button>
          <button onClick={submit} className="flex-1 py-2 bg-gold text-cream text-sm">
            Obtener cupón
          </button>
        </div>
      </div>
    </div>
  );
}