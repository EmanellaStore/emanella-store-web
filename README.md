# Emanella Store Web

Aplicación e-commerce de Emanella construida con Next.js App Router, Prisma y automatizaciones comerciales con n8n.

## Estado actual

El proyecto ya cubre el flujo completo de venta y postventa:

- tienda pública (`/`, `/catalogo`, `/producto/[slug]`);
- carrito persistido (Zustand + backend);
- checkout con cupones y creación de pedidos;
- panel admin para pedidos y productos;
- automatizaciones de lifecycle y retención con n8n;
- chatbot IA para asistencia en Telegram.

Documento técnico extendido: `ESTADO_ACTUAL_PROYECTO.md`.

## Stack

- Next.js `16.2.1` (App Router) + React `19`
- TypeScript (strict)
- Prisma + PostgreSQL
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Zustand (persistencia de carrito)
- Cloudinary (imágenes)
- `jose` para sesiones JWT

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run lint

npx prisma generate
npx prisma db push
npx prisma db seed
```

## Variables de entorno clave

```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
N8N_SECRET=
N8N_WEBHOOK_URL=
N8N_SHIPPING_WEBHOOK_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Arquitectura resumida

- `src/app/**`: páginas App Router y route handlers.
- `src/app/api/**`: capa HTTP (sin lógica de negocio pesada).
- `src/services/**`: lógica de negocio (productos, pedidos, checkout, auth).
- `src/lib/**`: utilidades, sesión, DB, validadores.
- `src/store/**`: estado cliente (carrito).
- `src/components/shop/**` y `src/components/admin/**`: UI por dominio.
- `src/flows/**`: flujos n8n versionados.

## Flujos n8n versionados

Ubicación: `src/flows`.

Incluye automatizaciones para:

- recuperación de carrito (`step 1`, `step 2`, `step 3`, cleanup `LOST`);
- notificaciones de lifecycle de pedido;
- campañas de marketing (`Welcome`, `Review Request`, `Repurchase`, `Winback`);
- chatbot IA en Telegram con búsqueda de productos y escalación a humano.

## Seguridad y operación

- Auth basada en cookie `session_token` firmada con JWT.
- Middleware protege `/admin/*` y `/api/admin/*`.
- Integraciones automatizadas pueden autenticarse por header `x-n8n-token` (`N8N_SECRET`).
- No subir secretos reales en archivos JSON de flujos o semillas de datos.

## Estructura principal

```text
src/
  app/
  components/
  services/
  lib/
  store/
  flows/
prisma/
```

## Analytics

El proyecto implementa el seguimiento para Meta Pixel. (Las integraciones de Google Analytics 4 y Meta Conversion API se encuentran deshabilitadas/comentadas en el código a petición).

**Eventos registrados (Pixel):**
- `PageView`: Vistas de todas las rutas de la app.
- `ViewContent`: Vistas al detalle de un producto.
- `AddToCart`: Adiciones al carrito.
- `InitiateCheckout`: Inicio del flujo de pago.
- `Purchase`: Finalización de la compra.
- `Contact`: Clics en el botón flotante de WhatsApp.
- `Search`: Búsquedas en el catálogo.
- `CompleteRegistration`: Registro exitoso en el formulario de descuento.
- `Lead`: Captura de lead a través del formulario de descuento.
