// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", ...loginData }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      if (data.isAdmin) {
        // Guardamos flag en sessionStorage para que el Navbar pueda
        // mostrar el ícono de admin (la cookie es httpOnly, no legible desde JS).
        sessionStorage.setItem("is_admin", "true");
        // Hard redirect: el navegador hace un nuevo request HTTP completo.
        // La cookie httpOnly ya está en el browser (la seteó el servidor).
        // El middleware la leerá en el nuevo request y permitirá el acceso.
        window.location.replace("/admin/orders");
      } else {
        localStorage.setItem("user_session", JSON.stringify(data.user));
        window.dispatchEvent(new Event("userSessionChange"));
        window.location.replace("/catalogo");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    if (registerData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: registerData.name,
          lastName: registerData.lastName,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Error al registrar");
        return;
      }

      localStorage.setItem("user_session", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userSessionChange"));
      window.location.replace("/catalogo");
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
            <span className="font-serif text-4xl font-semibold text-cacao tracking-widest">
              Emanella
            </span>
          </Link>
          <p className="font-sans text-xs text-warm-gray mt-2 tracking-widest uppercase">
            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </p>
        </div>

        <div className="bg-white border border-blush/30 p-8">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-warm-gray mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">Contraseña</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="text-red-500 text-xs font-sans bg-red-50 p-2 rounded">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cacao text-cream py-3 text-xs uppercase tracking-[0.3em] hover:bg-gold transition-colors disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </button>
              <div className="text-center pt-4 space-y-2">
                <Link href="/reset-password" className="text-xs text-gold hover:underline block">
                  ¿Olvidaste tu contraseña?
                </Link>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-xs text-warm-gray hover:text-cacao block w-full"
                >
                  ¿Nuevo cliente? <span className="text-gold">Regístrate</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-warm-gray mb-1">Nombre</label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-warm-gray mb-1">Apellido</label>
                  <input
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  placeholder="3001234567"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">Contraseña</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-warm-gray mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full border border-blush/50 bg-cream p-3 outline-none focus:border-gold font-sans text-sm"
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-xs font-sans bg-red-50 p-2 rounded">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cacao text-cream py-3 text-xs uppercase tracking-[0.3em] hover:bg-gold transition-colors disabled:opacity-50"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-xs text-warm-gray hover:text-cacao"
                >
                  ¿Ya tienes cuenta? <span className="text-gold">Inicia sesión</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/catalogo" className="text-xs text-warm-gray hover:text-gold">
            Ver catálogo sin registrar
          </Link>
        </div>
      </div>
    </main>
  );
}