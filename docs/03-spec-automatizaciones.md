# 03 · Spec de automatizaciones — n8n + WhatsApp API

n8n local: http://localhost:5678 · Flujos versionados: `src/flows/*.json` (11 archivos).
Permiso: modificar flujos libremente para su correcto funcionamiento.

## Inventario de flujos

| Flujo | Función | Canal actual |
|---|---|---|
| `cart-recovery-step-1/2/3.json` | Recuperación de carrito abandonado (3 toques, copy IA) | Telegram (WA desactivado) |
| `cart-cleanup-lost.json` | Marca `LOST` carritos viejos | — (cron) |
| `order-lifecycle.json` | Notificación por estado de pedido | Telegram |
| `payment-confirmation.json` | Confirmación de pago | por auditar |
| `Welcome Coupon.json` | Cupón de bienvenida | Telegram |
| `Review Request.json` | Solicitud de reseña post-entrega + cupón | Telegram |
| `Repurchase 30_60_90.json` | Recompra por ventanas 30/60/90 días | Telegram |
| `Winback.json` | Reactivación de inactivos | Telegram |
| `Chatbot IA.json` | Bot conversacional RAG (Groq + búsqueda semántica) | Telegram |

## Auditoría 2026-07-08 (hecha)

- **URLs**: los 3 `cart-recovery-step-*.json` usaban `http://localhost:3000` mientras
  el resto usa `http://host.docker.internal:3000` (n8n en Docker) → **corregido**,
  todos unificados a `host.docker.internal`.
- **`order-lifecycle.json` ya usa Meta Cloud API** (`graph.facebook.com/v19.0/{{PHONE_NUMBER_ID}}/messages`)
  → es la plantilla a seguir para migrar los demás flujos.
- **Los `cart-recovery-*` usan YCloud** (`api.ycloud.com/v2/whatsapp/messages`) —
  proveedor anterior; migrar a Cloud API cuando haya credenciales.
- **Seguridad:** el token `x-n8n-token` (= `N8N_SECRET`) está **hardcodeado** en los
  JSON versionados en Git → **rotar el secreto** y reemplazar por variable de entorno
  de n8n (`{{ $env.N8N_SECRET }}`) al importar los flujos actualizados.
- Los 10 flujos con canal usan **Telegram** como salida activa; el reemplazo por
  WhatsApp queda bloqueado por credenciales (D2): `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_ACCESS_TOKEN` de Meta Business.

## Trabajo Fase 6

1. **Auditoría**: por cada flujo verificar URLs (deben salir de variable de entorno,
   no hardcodeadas), token `x-n8n-token` = `N8N_SECRET`, endpoints existentes en
   `src/app/api/**`, y credenciales expuestas en los JSON (rotar las que aparezcan).
2. **Canal WhatsApp** (Decisión D2): reemplazar nodos Telegram por WhatsApp.
   - **Recomendado: Meta WhatsApp Cloud API oficial** — gratis hasta cierto volumen,
     nodo nativo en n8n, requiere: WhatsApp Business, número dedicado, plantillas
     (HSM) aprobadas para mensajes salientes fuera de ventana de 24h (crítico para
     campañas: welcome, winback, repurchase, review, recovery).
   - Alternativa no oficial (Evolution API/Baileys): sin plantillas ni costos, pero
     riesgo de baneo del número — no recomendada para el número comercial real.
   - El modelo `WhatsappMessage` (con `WaProvider`, `WaStatus`) ya está listo para
     registrar entrega/lectura vía webhooks de estado.
3. **Chatbot**: portar de Telegram a WhatsApp entrante (webhook Cloud API →
   n8n → APIs `/api/ai/*` → respuesta). Mantener escalación a humano.
4. **Pruebas end-to-end** de cada flujo contra la app local + Neon.

## ¿n8n o algo distinto? (Decisión D3)

Recomendación: **mantener n8n** — los 9+ flujos ya existen, es visual y el usuario
lo conoce. El problema real no es la herramienta sino el **hosting**: con la app en
Vercel y n8n en localhost, las automatizaciones solo corren cuando el PC está
encendido.

Opciones de producción, en orden recomendado:
1. **n8n self-hosted en un VPS/Railway/Render** (~5 USD/mes): cero migración de
   flujos, webhooks con URL pública estable (necesaria para WhatsApp Cloud API).
2. **n8n Cloud** (~20+ EUR/mes): cero ops, más caro.
3. **Migrar a Vercel Cron + route handlers**: elimina n8n, pero implica reescribir
   los 11 flujos en TypeScript y perder la edición visual — solo si se quiere
   consolidar todo en el repo. No recomendado ahora.

## Variables de entorno implicadas

`N8N_SECRET`, `INTERNAL_WEBHOOK_SECRET`, `N8N_ORDER_STATUS_WEBHOOK`, `STORE_URL`,
`NEXT_PUBLIC_APP_URL` + (nuevas si Cloud API): `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`.
