"use client";
import { LogOut } from "lucide-react";

export default function BotonSalir() {
  const salir = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.replace("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={salir}
      aria-label="Cerrar sesión"
      className="flex h-9 w-9 items-center justify-center text-on-dark/60 transition-colors hover:text-on-dark"
    >
      <LogOut size={17} strokeWidth={1.5} />
    </button>
  );
}
