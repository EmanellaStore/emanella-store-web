"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/orders");
    } else {
      setError("Contraseña incorrecta.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-full max-w-sm p-10 bg-white border border-blush/30">
        <h1 className="font-serif text-3xl text-cacao mb-2 text-center">Emanella</h1>
        <p className="font-sans text-xs text-warm-gray text-center tracking-widest uppercase mb-8">
          Panel Administrativo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
            required
          />
          {error && (
            <p className="text-red-500 text-xs font-sans">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cacao text-cream py-3 text-xs uppercase tracking-[0.3em] hover:bg-gold transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}