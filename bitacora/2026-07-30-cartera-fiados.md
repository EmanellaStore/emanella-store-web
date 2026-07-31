# Bitácora — 2026-07-30 · Módulo de Cartera (fiados y abonos)

Necesidad de Steven: reemplazar las notas de WhatsApp para llevar los fiados a
conocidos. Plan aprobado con correcciones suyas (ver `docs/05-spec-cartera.md`).

## Correcciones del usuario al plan inicial

- **Todo sale del catálogo**: los apodos de las notas ("postre mallow madness",
  "mantequilla") son productos reales. Los ítems se buscan en el catálogo con el
  precio autocompletado y **editable**, no como texto libre.
- **Sin responsables**: "Empleada de Luis" es simplemente el nombre de la persona.
- También se registran **ventas de contado**, no solo fiados.

## C1 — Datos

- 4 modelos nuevos en `prisma/schema.prisma`: `CarteraCliente`, `CarteraVenta`
  (con `tipo` CREDITO/CONTADO), `CarteraVentaItem`, `CarteraAbono`; tablas con
  prefijo `cartera_`. Enum `CarteraVentaTipo`.
- `prisma db push` a Neon: **solo agrega tablas**, no se tocó ninguna existente.
- Sin llaves foráneas duras al catálogo: cada ítem guarda `productId`/`variantId`
  más un *snapshot* de nombre y precio, para que el historial no cambie si luego
  se edita o borra el producto.

## C2 — Acceso y app en el celular

- Rol nuevo `CARTERA` (enum `UserRole`) + tipo de sesión actualizado.
- `proxy.ts`: `/cartera/*` y `/api/cartera/*` solo para `ADMIN` y `CARTERA`.
  Verificado: el usuario de cartera recibe **401 en `/api/admin/*`** y es
  redirigido fuera de `/admin`.
- Usuario compartido creado con `scripts/crear-usuario-cartera.ts`
  (`cartera@emanellastore.com`, contraseña aleatoria mostrada al ejecutarlo;
  volver a correrlo la regenera).
- **PWA**: `public/cartera.webmanifest` + íconos generados con
  `scripts/generar-icono-cartera.mjs` (monograma EA champán sobre grafito, 192 y
  512 px). Se instala en el celular como app aparte, `display: standalone`.
  El `public/icon.png` del proyecto **no se usó: es de otra marca ("Elysium")**.

## C3 y C4 — Aplicación

- `src/lib/cartera.ts`: atajo de miles (`parseMonto`), formato de dinero,
  cálculo de quincenas (`fechaPagoSugerida`), vencimientos y `parseFechaLocal`.
- `src/services/cartera.service.ts`: toda la lógica (saldos, ficha, crear venta
  con transacción, abonos, anulación, búsqueda en catálogo por palabras).
- APIs delgadas en `/api/cartera/{clientes,ventas,abonos,productos}`.
- Pantallas móviles: inicio (total por cobrar, vencidos, lista, buscador),
  nueva venta (fiado/contado, buscador de catálogo, cantidades, precio editable,
  atajos de quincena) y ficha (saldo, movimientos, abono en hoja emergente,
  recordatorio de WhatsApp y estado de cuenta para copiar).

## Bugs encontrados y corregidos durante la verificación

1. **Zona horaria**: una fecha de pago "15 de agosto" se guardaba como UTC y se
   mostraba "14 de agosto" en Colombia. Corregido con `parseFechaLocal` en las
   rutas de ventas y abonos.
2. **Fugas de la tienda en herramientas internas**: `/cartera` (y `/admin`)
   heredaban del layout raíz el botón flotante de WhatsApp, el carrito, el modal
   de bienvenida y **el Pixel de Meta** — es decir, la navegación interna del
   equipo se estaba reportando a Meta. Se creó `TiendaOverlays.tsx`, que los
   monta solo en las rutas de la tienda. Verificado: en `/cartera` no hay Pixel
   (`fbq` indefinido) y en la tienda sigue activo.

## Verificación end-to-end (preview móvil 375×812)

- Login con el usuario de cartera → rol CARTERA ✔
- Buscar "mallow" encuentra **Lattafa Mallow Madness** (el apodo funciona) ✔
- Fiado de Marcela con 4 productos → **total $610.000**, igual que su nota ✔
- Abono escribiendo "500" → muestra "= $500.000" → **saldo $110.000** ✔
- Venta de contado → saldo queda en **$0** (abono automático) ✔
- `npx tsc --noEmit` limpio ✔
- **Datos de prueba borrados**: las tablas de cartera quedaron vacías.

## Pendiente

- **C5**: cargar la cartera real (Steven debe pasar la lista de WhatsApp).
- **C6**: instalar la PWA en los celulares y probar en la calle.
- Cambiar la contraseña del usuario de cartera si se quiere una propia.

Sin commits (regla 1).
