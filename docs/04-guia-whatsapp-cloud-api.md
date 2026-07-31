# 04 · Guía — Obtener credenciales de WhatsApp Cloud API (Meta)

> Objetivo: conseguir `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` y
> `WHATSAPP_VERIFY_TOKEN` para que los flujos n8n envíen por WhatsApp.
> Costo: gratis hasta 1.000 conversaciones de servicio/mes; las plantillas de
> marketing tienen costo por conversación (~USD 0,0125–0,06 en Colombia).

## Requisitos previos

- Una cuenta de Facebook personal (administradora).
- **Un número de teléfono que NO esté registrado en la app normal de WhatsApp**
  (o estar dispuesto a migrarlo: al conectarlo a la API deja de funcionar en la
  app del celular). Recomendación: comprar una SIM nueva solo para la tienda y
  conservar tu número actual (+57 316 043 2747) para atención manual.

## Paso a paso

1. **Crear la app en Meta for Developers**
   1. Entra a https://developers.facebook.com/ → inicia sesión → "Mis apps" →
      **Crear app**.
   2. Tipo: **Empresa (Business)** → nombre: `Emanella Store` → correo → crear.
   3. En el panel de la app, busca el producto **WhatsApp** → "Configurar".
      Meta te pedirá vincular (o crear) un **Business Portfolio** — usa el de
      Emanella si ya existe (el mismo del Pixel/dataset `4498118253840617`).

2. **Configurar el número**
   1. En WhatsApp → **Configuración de la API** verás un número de prueba
      (sirve para testear ya mismo con hasta 5 destinatarios).
   2. Para producción: **Agregar número de teléfono** → nombre visible
      "Emanella Store", categoría Compras/Retail → verifica por SMS/llamada.
   3. Al terminar, en esa misma pantalla copia:
      - **Identificador del número de teléfono** → `WHATSAPP_PHONE_NUMBER_ID`
      - **Identificador de la cuenta de WhatsApp Business (WABA ID)** (guárdalo).

3. **Token de acceso permanente** (el de la consola caduca en 24h)
   1. Ve a https://business.facebook.com/settings → **Usuarios → Usuarios del
      sistema** → "Agregar" → nombre `n8n-automatizaciones`, rol **Administrador**.
   2. Al usuario del sistema → **Agregar activos** → Apps → tu app `Emanella
      Store` → permiso "Administrar app".
   3. Botón **Generar token** → selecciona la app → caducidad: **Nunca** →
      permisos: `whatsapp_business_messaging` y `whatsapp_business_management`
      → Generar → **copia el token** → `WHATSAPP_ACCESS_TOKEN`.
      (Solo se muestra una vez; guárdalo en un lugar seguro.)

4. **Verificación del negocio** (para pasar de 250 conversaciones/día a 1.000+)
   - Business Manager → Configuración → Centro de seguridad → **Iniciar
     verificación** (cámara de comercio o factura de servicios a nombre del
     negocio/representante). Tarda 1–5 días. Sin esto la API funciona, pero
     con límite diario bajo.

5. **Plantillas de mensaje (HSM)** — necesarias para iniciar conversación
   (todas nuestras campañas: recuperación de carrito, welcome, winback,
   repurchase, review, lifecycle):
   1. WhatsApp Manager → **Plantillas de mensajes** → Crear.
   2. Categoría **Marketing** (carrito/campañas) o **Utilidad** (estado de
      pedido). Idioma `es`. Usa variables `{{1}}`, `{{2}}`.
   3. Sugeridas para empezar (los flujos las llenan con IA/datos):
      - `carrito_recordatorio` (Marketing): "Hola {{1}} 👋 dejaste {{2}} en tu
        carrito de Emanella. ¿Te lo reservamos? {{3}}"
      - `pedido_estado` (Utilidad): "Hola {{1}}, tu pedido {{2}} está {{3}}. {{4}}"
      - `cupon_bienvenida` (Marketing): "Bienvenida al círculo Emanella, {{1}} ✨
        Tu cupón: {{2}}"
   4. Aprobación: minutos a 24h por plantilla.

6. **Webhook (para el Chatbot / respuestas entrantes)**
   - App → WhatsApp → **Configuración** → Webhook:
     - URL: la del webhook de n8n (cuando n8n tenga URL pública) o
       `https://<tu-app>/api/webhook/whatsapp` si lo recibimos en Next.
     - Token de verificación: inventa uno → `WHATSAPP_VERIFY_TOKEN`.
     - Suscribirse al campo **messages**.
   - ⚠️ Con n8n local no hay URL pública: para el chatbot entrante hará falta
     el VPS/túnel (decisión D3). Las campañas salientes SÍ funcionan con n8n
     local (solo hacen llamadas salientes a Graph API).

## Al terminar, agregar al `.env` (y a las variables de n8n)

```
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...
```

Con esas dos primeras variables migro los nodos de Telegram → Cloud API en los
flujos (el patrón ya existe en `order-lifecycle.json`:
`POST https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages` con header
`Authorization: Bearer {ACCESS_TOKEN}`).
