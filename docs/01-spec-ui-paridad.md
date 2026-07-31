# 01 · Spec de paridad UI — Shopify → Next.js

Referencia viva: https://emanellastore.com/ · Tema fuente: `emanella-shopify/emanella-theme/`
(CSS clave: `assets/emanella.css`, JS: `assets/emanella.js` — solo lectura).

## Home (`src/app/page.tsx`)

Orden de secciones (paridad con `templates/index.json` de Shopify):

1. **Hero** — H1 Fraunces + subtítulo + 2 CTAs (primary + ghost). Fade-in al cargar.
2. **Categorías** "Encuentra el tuyo" — 3 cards: Hombre · Dama · Unisex → `/catalogo?categoria=…`
3. **Best sellers** "— Los más deseados —" — grid de ProductCards.
4. **Novedades** "— Recién llegados —" — grid por `createdAt`.
5. **Trust bar** — 4 columnas con ícono + texto (vocabulario oficial).
6. **Historia** — "El buen perfume, al alcance de tu piel" + imagen editorial.
7. **Newsletter** — "Entra al círculo Emanella" (captura ya existe: WelcomeCaptureModel).

## PLP (`src/app/catalogo`)

- Header editorial: eyebrow `— Colección —` + título Fraunces centrado + hairline champán + descripción.
- **Filtros horizontales arriba** (no sidebar), grid full-width, **5 columnas desktop** (~1560px contenedor), 2 en móvil.
- Filtros: categoría/género, precio, disponibilidad (los datos de perfume llegan en Fase 4).
- Orden: destacados / precio asc-desc / recientes.

## PDP (`src/app/producto/[slug]`)

- Galería (hasta 4 imágenes, ya soportado) + selector de variantes.
- **Pirámide olfativa** — componente firma: Salida · Corazón · Fondo con hairline
  champán vertical. No renderiza si el producto no tiene notas.
- **Ficha técnica en chips**: Concentración · Familia · Duración · "Inspirado en"
  (solo 1.1). Cada chip solo si tiene dato.
- **CTA WhatsApp** verde premium con mensaje pre-armado (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
- Acordeón "Envíos y entregas".
- **Carrusel "También te pueden gustar"**: scroll-snap horizontal, cards 300px,
  ~10 productos de la misma categoría, dedupe + excluye producto actual, flechas
  ‹ › desktop (disabled en extremos), swipe en móvil.
- **"Vistos recientemente"**: slugs en `localStorage`, oculto sin historial.

## Carrito

- Convertir página `/carrito` en **drawer lateral** (manteniendo la ruta como fallback).
- Spinner al agregar (nunca pantalla en negro), botones "Ver carrito" y "Finalizar compra".
- Mantener toda la lógica actual de Zustand + sync backend (recuperación de carrito).

## Checkout (`src/app/checkout`)

- Formulario claro sobre fondo lila; **resumen del pedido en panel grafito oscuro**
  (paridad con branding del checkout Shopify: grafito `#2A2330`, champán, lila).
- Mantener: cupones, envío gratis por umbral, prefill, creación transaccional de orden.

## Footer

- Grafito `#2A2330`, texto `#F2EFF6`, compacto (paddings pequeños), de lado a lado.
- Columnas: marca (con aire a la derecha) · Tienda · Contacto. Sin columnas vacías.
- Íconos de pago solo cuando haya pasarela activa.

## Navbar

- Jost 11–13px uppercase tracking 0.18em. Fondo lila (no negro), logo centrado o
  a la izquierda según referencia live, carrito con contador, anuncio superior opcional.

## Reglas transversales

- Sin border-radius en cards; hairlines en vez de bordes pesados.
- Jerarquía: Fraunces títulos (tipo oración), Jost labels/eyebrows en versalitas.
- AA en todos los pares fondo/texto; focus visible; `prefers-reduced-motion`.
- Admin (`/admin`) NO necesita re-diseño en esta migración (solo campos nuevos de producto).
