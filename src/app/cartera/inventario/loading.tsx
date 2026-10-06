// src/app/cartera/inventario/loading.tsx — se muestra al instante al tocar la
// pestaña mientras se lee el Excel (el Apps Script tarda ~2-3 s). Sin esto, la
// pantalla se quedaba quieta en la pestaña anterior y parecía que no respondía.
// Imita la forma de la página: resumen, buscador, filtros y filas.
export default function CargandoInventario() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <h1 className="font-serif text-2xl text-cacao">Inventario</h1>
      <p className="sr-only">Leyendo el inventario del Excel…</p>

      <div className="motion-safe:animate-pulse space-y-4">
        {/* Resumen */}
        <div className="border border-blush bg-warm-black px-5 py-4">
          <div className="h-2.5 w-40 bg-on-dark/15" />
          <div className="mt-3 h-8 w-44 bg-gold/25" />
          <div className="mt-3 h-2.5 w-52 bg-on-dark/15" />
        </div>

        {/* Buscador y filtros */}
        <div className="h-12 border border-blush bg-bg-card" />
        <div className="flex gap-2">
          {[64, 76, 84, 96].map((w) => (
            <div key={w} className="h-8 border border-blush bg-bg-card" style={{ width: w }} />
          ))}
        </div>

        {/* Filas */}
        <ul className="divide-y divide-blush border border-blush bg-bg-card">
          {Array.from({ length: 7 }, (_, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-4 py-4">
              <div className="space-y-2">
                <div className="h-3.5 bg-blush" style={{ width: `${9 + ((i * 37) % 6)}rem` }} />
                <div className="h-2.5 w-20 bg-blush/70" />
              </div>
              <div className="h-4 w-20 bg-blush" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
