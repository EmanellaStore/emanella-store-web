# Bitácora — 2026-07-08 (sesión 4) · Panel admin ampliado (estilo Shopify)

Pedido de Steven: revisar login/admin/inventario y mejorarlos según lo que
ofrece Shopify, con lo que ya tenemos en la base de datos.

## Diagnóstico

- El panel solo tenía **Pedidos** y **Productos**; `/admin` era un redirect.
- **Bug**: `AdminSidebar` seguía con `text-cacao`/`text-cacao-light` (tinta
  oscura del tema nuevo) sobre el grafito → texto ilegible.
- El stock solo se veía como total por producto en la tabla de productos; para
  ajustarlo había que abrir el formulario completo del producto.
- No había vista de clientes ni de cupones (los datos ya existían: `Customer`
  con totalSpent/orderCount/lastPurchaseAt, `Coupon` con usos/vencimiento).

## Nuevo (paridad con secciones del admin de Shopify)

1. **Inicio (`/admin`)** — dashboard: ventas de hoy / 7 días / 30 días (solo
   pedidos CONFIRMADO/ENVIADO/ENTREGADO), pedidos PENDIENTES, pedidos
   recientes, alertas de **stock bajo (≤3)** y **más vendidos de 30 días**.
2. **Inventario (`/admin/inventory`)** — tabla por variante (imagen, producto,
   variante, SKU, precio, badge OK/BAJO/AGOTADO) con **edición de stock inline**
   (stepper [− n +] e input directo, guardado optimista) vía nueva API
   `PATCH /api/admin/inventory` (absoluto o delta, clamp ≥ 0). Búsqueda por
   producto/SKU y filtros Todo / Stock bajo / Agotados.
3. **Clientes (`/admin/customers`)** — lista con búsqueda (nombre/teléfono/
   ciudad), orden por recientes o mayor gasto, pedidos, total gastado, última
   compra y acceso directo a WhatsApp del cliente.
4. **Cupones (`/admin/coupons`)** — lista con estado real (ACTIVO/INACTIVO/
   VENCIDO/AGOTADO), usos (x/máx), campaña y vencimiento; **crear cupón manual**
   (código opcional autogenerado, % o valor fijo, mínimo, usos máximos,
   vencimiento) y activar/desactivar. Nueva API `/api/admin/coupons`
   (POST/PATCH). La generación automática de campañas sigue en
   `/api/admin/coupons/generate` (n8n).
5. **Sidebar** — contraste corregido (`text-on-dark`), logo blanco del tema, y
   navegación: Inicio · Pedidos · Productos · Inventario · Clientes · Cupones.

Seguridad: todas las rutas nuevas quedan detrás del proxy existente
(`/api/admin/*` exige sesión ADMIN o `x-n8n-token`).

## Nota de seguridad detectada

- El seed crea `admin@emanella.com / admin123` (credencial demo). **Cambiarla
  antes del lanzamiento** (o eliminar ese usuario en producción).

## Login (pulido)

- Logo de imagen (el del tema Shopify) en vez de texto; card sharp con borde
  hairline (se quitó `rounded-2xl` + sombra pesada, contra las reglas de marca);
  links en champán hondo (`gold-dark`, AA) y botones en sentence case.

## Verificación (preview, sesión admin real)

- `npx tsc --noEmit` limpio.
- Login vía API con el admin del seed → sesión ADMIN OK; el proxy dejó pasar
  a `/admin/*`.
- Dashboard: métricas (ventas hoy/7/30, pendientes), pedidos recientes, stock
  bajo y más vendidos renderizan con datos reales de Neon.
- Inventario: 100 variantes listadas; **stepper de stock probado en vivo:
  0 → +1 → 1 → −1 → 0** (persistió en Neon, prueba neta cero).
- Clientes: 5 clientes, $1.170.000 histórico, links directos a WhatsApp.
- Cupones: 1 activo listado con estado calculado + botón "Crear cupón".
- Nota: el navegador puede tener cacheado el redirect viejo `/admin → /admin/orders`
  (era un redirect 307); con Ctrl+Shift+R desaparece.
