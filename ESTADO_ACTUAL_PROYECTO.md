# Estado Actual del Proyecto - Emanella Store Web

Fecha de actualización: 2026-04-27

## 1) Resumen ejecutivo

`emanella-store-web` es una tienda e-commerce construida con Next.js (App Router), TypeScript estricto y Prisma sobre PostgreSQL. El proyecto ya cuenta con flujo completo de compra (catálogo -> carrito -> checkout -> orden), panel administrativo para operación diaria, segmentación de clientes, cupones automáticos y automatizaciones externas mediante n8n (recuperación de carrito, lifecycle de pedido, campañas de retención y chatbot IA en Telegram).

El estado general es funcional y bien estructurado por capas (rutas API + servicios + validación), con foco claro en crecimiento de conversión y retención.

## 2) Stack y configuración actual

- Framework: Next.js `16.2.1` + React `19`.
- Lenguaje: TypeScript (strict).
- Estilos: Tailwind CSS v4 (`@tailwindcss/postcss`).
- Base de datos: PostgreSQL con Prisma `6.x`.
- Estado cliente: Zustand (carrito persistido en localStorage: `emanella-cart-storage`).
- Auth: JWT + middleware para rutas admin.
- Integraciones:
  - Cloudinary (imágenes de productos).
  - n8n (automatizaciones y campañas).
  - Telegram (canal activo en los flujos actuales).
  - Groq LLM (generación de mensajes y chatbot).
- Configuración clave detectada:
  - `reactCompiler: true`.
  - Prisma externalizado para runtime de Next.

## 3) Funcionalidades implementadas

## Tienda (frontend cliente)

- Home con productos destacados.
- Catálogo con búsqueda y filtros.
- Detalle de producto por `slug` con galería e información de variantes.
- Carrito con:
  - agregar/eliminar ítems,
  - actualización de cantidades,
  - persistencia local,
  - sincronización con backend para recuperación.
- Captura de usuario/comportamiento para journeys de marketing.

## Checkout y órdenes

- Checkout con datos de cliente, dirección, ciudad, notas y método de pago.
- Soporte para cupones y cálculo de envío (incluye lógica de envío gratis por umbral/regla).
- Creación transaccional de pedido:
  - upsert de cliente,
  - creación de orden e ítems,
  - evento inicial de orden,
  - descuento de inventario,
  - registro de uso de cupón,
  - actualización de estado del carrito.
- Disparo de webhook interno para automatizaciones de lifecycle.

## Panel admin

- Dashboard/listado de pedidos con gestión de estado.
- Detalle de pedido con edición de:
  - ítems,
  - datos del cliente,
  - tracking/transportadora para envío.
- Gestión de productos:
  - crear/editar/eliminar,
  - variantes,
  - hasta 4 imágenes por producto,
  - filtros y paginación.
- Login/admin protegido vía middleware y cookie de sesión.

## APIs y servicios

- Auth: login, logout, sesión actual, reset password.
- Cart: tracking, abandono, restauración y marcado de recuperación.
- Checkout: creación de orden.
- Admin: productos, pedidos, acciones por pedido, generación de cupones.
- Customers: segmentación y actualización de marcadores de campañas.
- Reviews: solicitud/registro y publicación.
- AI: contexto, búsqueda semántica de productos y guardado de respuesta.
- Webhook: entrada/salida de actualizaciones de estado de pedido.

## 4) Estado de datos, persistencia y operación

- Prisma schema con modelos de e-commerce + mensajería + cupones + tracking.
- Carrito híbrido:
  - cliente (Zustand/localStorage),
  - servidor (tablas `Cart`/`CartItem` con estados operativos).
- Estados operativos de carrito y recuperación en uso (`ACTIVE`, `ABANDONED`, `RECOVERING`, `RECOVERED`, `LOST`).
- Pipeline de campañas conectado a segmentación backend y cupones dinámicos.

## 5) Flujos n8n encontrados (carpeta `src/flows`)

Se encontraron 10 flujos JSON activos/documentados:

1. `cart-cleanup-lost.json`
   - Limpieza programada de carritos no recuperados.
   - Marca como `LOST` carritos antiguos en etapa final.

2. `cart-recovery-step-1.json`
   - Primer contacto de recuperación de carrito.
   - Toma carritos abandonados (`step=1`), genera copy con IA y registra progreso.

3. `cart-recovery-step-2.json`
   - Segundo contacto de recuperación.
   - Misma lógica por etapa con mensaje más persuasivo.

4. `cart-recovery-step-3.json`
   - Último intento de recuperación.
   - Incluye enfoque de cierre y/o incentivo.

5. `order-lifecycle.json`
   - Notificación por estado de pedido (`PENDIENTE`, `CONFIRMADO`, `ENVIADO`, `ENTREGADO`, `CANCELADO`).
   - Construye mensaje por estado, envía notificación y registra log.

6. `Review Request.json`
   - Campaña para solicitar reseña después de entrega.
   - Segmenta clientes elegibles, genera cupón y marca `review_requested`.

7. `Repurchase 30_60_90.json`
   - Campañas de recompra por ventana temporal.
   - Segmenta por antiguedad, genera cupón variable y actualiza etapa.

8. `Welcome Coupon.json`
   - Cupón de bienvenida para nuevos clientes sin compra.
   - Segmenta, genera beneficio de bienvenida y marca envío.

9. `Winback.json`
   - Reactivación de clientes inactivos (winback).
   - Segmenta + cupón de reactivación + actualización de marcador.

10. `Chatbot IA.json`
    - Bot conversacional en Telegram con RAG de productos.
    - Soporta escalación a humano y persistencia de conversaciones.

Nota operativa: en varios flujos la salida visible está orientada a Telegram y algunos nodos de WhatsApp aparecen desactivados.

## 6) Estado general del proyecto

- Arquitectura principal bien encaminada y coherente con patrón de servicios.
- Cobertura funcional alta para operación e-commerce end-to-end.
- Integración de automatización comercial avanzada ya implementada.
- Base lista para crecimiento en:
  - observabilidad,
  - endurecimiento de seguridad,
  - documentación operativa.

## 7) Riesgos/pendientes recomendados

- Revisar y rotar secretos/tokens expuestos en archivos de flujos JSON.
- Evitar credenciales demo hardcodeadas fuera de entornos de desarrollo.
- Centralizar configuración de URLs por entorno (dev/staging/prod).
- Actualizar README principal para reflejar arquitectura y operación reales.
- Revisar y limpiar logs de depuración en producción.

## 8) Conclusión

El proyecto está en un estado maduro para operación comercial real: ya integra catálogo, checkout, órdenes, administración, segmentación y automatizaciones de retención. El siguiente salto recomendado no es tanto de funcionalidades base, sino de robustez operativa (seguridad de secretos, documentación y estandarización por entorno) para escalar con menor riesgo.
