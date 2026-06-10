"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ResetMode = "request" | "reset";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  
  const [mode, setMode] = useState<ResetMode>("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setMode("reset");
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "requestReset", email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al solicitar recuperación");
        return;
      }

      setSuccess(data.message);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword", token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restablecer contraseña");
        return;
      }

      setSuccess("Contraseña restablecida correctamente");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-serif text-4xl font-semibold text-cacao tracking-widest">Emanella <span className="text-gold">Store</span></span>
          </Link>
          <p className="font-sans text-xs text-warm-gray mt-2 tracking-widest uppercase">
            {mode === "request" ? "Recuperar Contraseña" : "Nueva Contraseña"}
          </p>
        </div>

        <div className="bg-beige border border-blush/10 p-8 rounded-2xl shadow-lg shadow-black/20">
          {success && (
            <div className="bg-green-50 text-green-700 p-4 text-center text-sm mb-4">
              {success}
            </div>
          )}

          {mode === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs text-warm-gray mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs font-sans">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cacao text-cream py-3 text-xs uppercase tracking-[0.3em] hover:bg-gold transition-colors disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Enlace"}
              </button>
              <div className="text-center pt-4">
                <Link href="/login" className="text-xs text-warm-gray hover:text-gold">
                  Volver a iniciar sesión
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-warm-gray mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs font-sans">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cacao text-cream py-3 text-xs uppercase tracking-[0.3em] hover:bg-gold transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Contraseña"}
              </button>
              <div className="text-center pt-4">
                <Link href="/login" className="text-xs text-warm-gray hover:text-gold">
                  Volver a iniciar sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}