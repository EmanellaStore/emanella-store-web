# Bitácora — 2026-07-08 (sesión 2) · Fase 4 completa, Wompi, rotación de secret

Autorizaciones de Steven: (1) ejecutar `prisma db push`, (2) usar llaves Wompi del
.env, (3) entregar guía WhatsApp, (4) rotar N8N_SECRET.

## Fase 4 — Datos (completa)

- `npx prisma db push` ejecutado contra Neon: columnas de perfume creadas
  (nullable, sin pérdida de datos). Primer intento falló regenerando el cliente
  (DLL bloqueado por el dev server) → se detuvo el server y quedó regenerado.
- Código actualizado: `ProductSchema` (Zod), `ProductInput`, `createProduct`/
  `updateProduct` (normalizan ""→null, genero→lowercase) y `ProductForm` admin
  con fieldset "Perfil olfativo" (3 notas + concentración/familia/duración/
  inspirado en + select de género).
- **Importación desde Shopify (MCP GraphQL)**: se leyeron los 100 productos con
  metafields `perfume.*` y tags de género → snapshot en
  `scripts/shopify-perfume-data.json` + script `scripts/import-perfume-data.ts`
  (cruce slug↔handle con fallback por nombre normalizado y tolerancia a guion
  final; `--dry-run` soportado). Resultado: **100/100 actualizados** (el único
  desfase era `moshino-toy-2-black-` con guion final).
- Verificado en preview: PDP `yara-elixir` muestra pirámide olfativa completa,
  chips (EDP · Floral dulce · 6 a 8 horas) y notas; `/catalogo?genero=hombre`
  filtra 34 productos correctos.

## Fase 5 — Wompi (integrado; falta registro del webhook por el usuario)

- Llaves encontradas en `.env`: `WOMPI_PUBLIC_KEY` (pub_prod_…), `SECRET_EVENT`,
  `INTEGRIDAD_KEY` — producción.
- Nuevo `src/lib/wompi.ts`: URL de Web Checkout con firma de integridad
  SHA256(ref+monto+COP+secreto) y verificación de checksum de eventos.
- Nuevo `POST /api/payments/wompi`: genera la URL firmada para una orden
  PENDIENTE (validada contra una orden real: host, params y firma 64-hex OK).
- Nuevo `POST /api/webhook/wompi`: verifica checksum (401 si inválido — probado),
  valida el monto contra `totalAmount` (si difiere: OrderEvent de alerta y no
  confirma), y con APPROVED hace PENDIENTE→CONFIRMADO + OrderEvent +
  `notifyOrderStatusChange` (dispara el lifecycle n8n).
- Checkout: nueva opción **"Paga en línea con Wompi"** (por defecto) → crea la
  orden y redirige al Web Checkout; si falla la generación de URL cae a
  `/gracias` con la orden PENDIENTE. Verificado en preview (radios + resumen).
- **Pendiente del usuario:** en Wompi → Desarrolladores → Eventos registrar
  `https://<dominio>/api/webhook/wompi` (con la app desplegada) y hacer un pago
  real de prueba (mismo gotcha que pasó en Shopify: sin registrar eventos, los
  pagos no confirman pedidos).

## Seguridad — N8N_SECRET rotado

- `scripts/rotate-n8n-secret.ts` generó token nuevo (crypto.randomBytes) y lo
  reemplazó en `.env`, `.env.local` y 9 flujos (`cart-recovery-1/2/3`, `Chatbot
  IA`, `payment-confirmation`, `Repurchase`, `Review Request`, `Welcome Coupon`,
  `Winback`). El valor viejo queda inservible.
- **Pendiente del usuario:** reimportar los flujos en n8n local (traen además
  las URLs corregidas) y reiniciar el dev server/redeploy para tomar el nuevo env.

## Guía WhatsApp Cloud API

- `docs/04-guia-whatsapp-cloud-api.md`: paso a paso completo (app en Meta for
  Developers, número dedicado, token permanente vía usuario del sistema,
  verificación del negocio, plantillas HSM sugeridas, webhook + nota de que el
  chatbot entrante requiere URL pública → D3).

## Verificación

- `npx tsc --noEmit` limpio tras todos los cambios.
- Endpoints Wompi probados (404 orden inexistente, 401 firma inválida, URL real).
- Sin commits (regla 1).
