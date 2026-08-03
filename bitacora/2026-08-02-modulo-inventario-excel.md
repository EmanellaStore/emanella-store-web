# Bitácora — 2026-08-02 · Módulo de inventario atado al Excel

Steven pidió un inventario tipo la cartera (app aparte pero dentro del proyecto,
instalable en el celular), atado **solo al Excel** de Google Sheets — sin tocar
Neon, porque lo productivo hoy es Shopify y sincronizar la base de datos sería
trabajo innecesario. El Excel es la única fuente de la verdad: si se edita en la
app, se refleja en el Excel.

Excel: https://docs.google.com/spreadsheets/d/1LzUWaZoafRbjcdZpVnMa1_olL9VrPpa5IGaD0plL48Y

## Decisiones

- Precio público de la tienda = columna **Precio Detal** (para referencia; hoy no
  se sincroniza con Neon, solo se ve/edita en el Excel).
- Sincronización: la app **lee** el Excel al abrir + botón "refrescar"; **escribe**
  al Excel al instante cuando se edita. Sin cron ni Apps Script.
- Edición desde la app: **stock, los tres precios (compra/mayorista/detal) y estado.**
- Acceso: **mismo login de la cartera** (rol ADMIN o CARTERA).

## Lo construido

- `src/lib/inventario.ts` — helpers puros: formato/parseo de moneda, normalización,
  resolución de columnas por encabezado (tolera el typo "Precio Deltal"), letras A1.
- `src/lib/google-sheets.ts` — transporte hacia el Excel. **Cambió de service
  account a Google Apps Script**: la organización de Steven bloquea las llaves JSON
  (`iam.disableServiceAccountKeyCreation`). Ahora la app llama a un Web App de Apps
  Script pegado en el Excel, protegido con secreto compartido. Sin Google Cloud.
  (`scripts/inventario-apps-script.gs` = el código a pegar.)
- `src/services/inventario.service.ts` — `getInventario()` (encuentra la tabla
  principal por su encabezado y la lee hasta la primera fila sin nombre) y
  `actualizarProducto(fila, patch)` (escribe solo columnas editables, nunca las de
  fórmula; valida números y estado). Cache del layout (título de hoja + columnas).
- `src/app/api/inventario/route.ts` — GET (refrescar) y PATCH (guardar).
- `src/app/inventario/` — layout (PWA, manifest, ícono), page (estados: sin
  credencial / error / lista).
- `src/components/inventario/InventarioLista.tsx` — resumen (valor a costo,
  unidades, con-stock), buscador, filtros (todos/en stock/agotados/por comprar),
  lista tocable.
- `src/components/inventario/EditorProducto.tsx` — modal: stepper de stock, tres
  precios con margen en vivo, estado; guarda al Excel.
- `public/inventario.webmanifest` + `public/inventario-icon-{192,512}.png`
  (monograma EA en champán para distinguirlo de Cartera, que va en blanco).
- `scripts/generar-icono-inventario.mjs`.
- `src/proxy.ts` — protege `/inventario` y `/api/inventario` (ADMIN/CARTERA).
- `src/components/shop/TiendaOverlays.tsx` — `/inventario` fuera de los overlays
  de tienda (no ensucia métricas ni muestra carrito).
- Enlace de salto Cartera ↔ Inventario en ambos headers (comparten login).

## Verificación (dev)

- `npx tsc --noEmit` limpio.
- `/api/inventario` sin sesión → 401. `/inventario` sin sesión → redirige a
  `/login?destino=inventario`.
- Con login de cartera: `/inventario` renderiza el estado "Falta conectar el Excel"
  (aún sin service account) sin errores de servidor ni consola. Header muestra el
  switch a Cartera.

## Pendiente (Fase de conexión — depende de Steven)

Pegar el Apps Script (`scripts/inventario-apps-script.gs`) en el Excel
(Extensiones → Apps Script), desplegarlo como Web App ("cualquier usuario",
protegido por secreto), y poner 2 variables en Vercel: `INVENTARIO_SCRIPT_URL` y
`INVENTARIO_SCRIPT_SECRET`. Paso a paso en `docs/07-inventario-conexion-google.md`.
Sin esto, el módulo muestra "falta conectar" pero no lee/escribe.

> Nota: el primer intento fue con service account, pero la organización bloquea la
> creación de llaves JSON (`iam.disableServiceAccountKeyCreation`). Por eso se pasó
> a Apps Script, que además no requiere Google Cloud.

Sin commits (regla 1).
