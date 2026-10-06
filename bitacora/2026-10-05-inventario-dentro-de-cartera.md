# Bitácora — 2026-10-05 · El inventario pasa a ser una pestaña de la cartera

Steven: en la app de cartera hay tres pestañas (Cartera, Historial, Inventario),
pero Inventario "se abre como una pestaña aparte", sin la fluidez de Historial.

## Causas (dos que se sumaban)

1. **Fuera del alcance de la app instalada.** El manifest de la cartera tiene
   `scope: "/cartera"`; el inventario vivía en `/inventario`. En la app instalada
   en el celular, navegar fuera del scope abre una ventana del navegador (con
   barra de dirección): la "pestaña aparte".
2. **Otro layout.** `/inventario` tenía su propio `layout.tsx` (otro logo, otro
   título, sin la pestaña Historial y con su propio manifest), así que al entrar
   cambiaba toda la barra de arriba.

Además, el inventario lee el Excel en cada visita (~2,5 s por el Apps Script) y
durante esa espera la pantalla se quedaba quieta en la pestaña anterior.

## Qué se hizo

- `src/app/inventario/page.tsx` → `src/app/cartera/inventario/page.tsx` (con
  título "Inventario", como Historial). Usa el layout de la cartera: misma barra,
  mismas pestañas, dentro del scope.
- Se borró `src/app/inventario/layout.tsx`. `/inventario` queda como redirección
  a `/cartera/inventario` para enlaces y accesos viejos.
- `NavCartera`: la pestaña apunta a `/cartera/inventario`. Nueva `MarcaCartera`
  (logo + "Cartera") que se marca en dorado en la lista, la ficha y la nueva
  venta, igual que las otras pestañas.
- `cartera/inventario/loading.tsx`: pantalla de carga con la forma de la página
  (resumen, buscador, filtros, filas) que aparece al instante mientras se lee el
  Excel. Respeta `prefers-reduced-motion` (`motion-safe:animate-pulse`).
- `/api/inventario` no cambia, ni el acceso (ADMIN y CARTERA, igual que antes).

## Verificación (dev, vista de celular)

- `npx tsc --noEmit`: 0 errores en `src/`.
- Navegación sin recarga: se dejó una marca en `window` antes de tocar
  Inventario y siguió ahí después (cambio dentro de la app, no recarga completa).
  Barra igual en las tres pestañas, Inventario en dorado, 145 productos.
- Tiempos (ya compilado): Historial ~0,4 s; Inventario ~2,3–2,5 s hasta tener los
  datos. Con la pantalla de carga, la pestaña **responde en 42 ms** (2 de 2
  pruebas).
- `/inventario` → redirige a `/cartera/inventario` (200).
- Sin errores en el servidor.
- Nota: al mover carpetas de rutas volvió a dañarse la caché de Turbopack
  (`/api/auth` en 404); se resolvió borrando `.next`.

## Para Steven

Si en el celular tiene instalado el ícono aparte de **"Inventario"**, conviene
quitarlo: ahora redirige a la cartera, y desde esa app se abriría en el
navegador. El inventario se usa desde la pestaña dentro de **Cartera**.
