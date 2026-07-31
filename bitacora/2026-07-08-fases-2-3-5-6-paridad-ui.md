# Bitácora — 2026-07-08 · Fases 2–3 completas, 5 y 6 parciales

Ejecución autónoma autorizada por Steven ("adelante, ejecuta todos los pasos sin
preguntarme; para solo ante bloqueantes").

## Fase 2 — Componentes

- **`ProductCard.tsx`** reescrito (estilo Amelie, paridad `emanella.css` del tema
  Shopify): sharp, caja de imagen cuadrada `bg-beige` + borde hairline, `object-contain`,
  zoom 1.03 al hover, 2ª imagen al hover, badge de descuento grafito, título 2 líneas
  fijas + precio con alto reservado (Fraunces w600 champán hondo). **Barra única
  oscura al hover** con "Agregar al carrito" + stepper [− 1 +] integrado; agrega al
  carrito real (Zustand + trackAddToCart + toast "Agregado") y abre el drawer.
  En móvil la barra es siempre visible; en desktop `pointer-events` controlados.
- **`CartDrawer.tsx`** (nuevo) + **`useUiStore.ts`** (nuevo): drawer lateral con
  ítems, stepper, eliminar, subtotal, "Finalizar compra" y "Ver carrito". Se abre
  desde el ícono de la bolsa (antes navegaba a /carrito) y al agregar productos.
  Cierre por Escape/overlay; bloquea scroll del body. Montado en `layout.tsx`.
  Fix: `getServerSnapshot` cacheado (constante módulo) para `useSyncExternalStore`.
- **`Navbar.tsx`**: tracking 0.18em, badge del carrito grafito, y **menú móvil
  agregado — el botón hamburguesa existía pero no renderizaba nada** (bug).
- **`Footer.tsx`**: compacto (py-12), grid `1.4fr 1fr 1fr 1fr` con aire en la marca,
  columnas Tienda + Legal + Contacto (redes fusionadas en Contacto), copy oficial,
  "Secure checkout/Worldwide shipping" → "Envíos a toda Colombia con guía de rastreo".
- **`HeroSection.tsx`**: copy oficial ("Que te recuerden por cómo hueles" + subtítulo),
  CTAs "Explorar la colección" (grafito) y "Lo nuevo →" (ghost champán).

## Fase 3 — Páginas

- **Home (`page.tsx`)** reconstruido con el orden del `index.json` de Shopify:
  hero → "Encuentra el tuyo" (Hombre·Dama·Unisex, cards tipográficas → `?genero=`) →
  "— Best sellers — Los más deseados" → "— Novedades — Recién llegados" → trust bar
  (4 columnas, vocabulario oficial) → historia ("El buen perfume, al alcance de tu
  piel") con **pirámide olfativa** editorial → newsletter "Entra al círculo Emanella"
  (**`NewsletterSection.tsx`** nuevo: captura nombre+WhatsApp → `/api/customers/upsert`
  + trackLead) → footer.
- **Servicios nuevos** en `product.service.ts`: `getBestSellers()` (ranking real por
  unidades vendidas vía `orderItem.groupBy`, rellena con recientes) y
  `getNewestProducts()`.
- **PLP `/catalogo`**: header editorial (eyebrow — Colección — + hairline champán),
  contenedor 1560px, grid 5 columnas desktop, chips de categoría + **género**
  (hombre/dama/unisex) y soporte `?orden=recientes`. El filtro de género se aplica
  en memoria y se desactiva si ningún producto tiene género aún (no vacía el
  catálogo antes de la migración/importación).
- **PDP `/producto/[slug]`**: precio principal (Fraunces + tachado + badge %),
  **`PerfumeSpecs.tsx`** (chips concentración/familia/duración/"Inspirado en"),
  **`PerfumePyramid.tsx`** (salida·corazón·fondo con hairline champán),
  **`WhatsAppCta.tsx`** (verde premium degradado + sombra, mensaje pre-armado),
  acordeón "Envíos y entregas" (`<details>` nativo), sección "Compromiso Emanella"
  re-escrita, **`ProductCarousel.tsx`** ("También te pueden gustar": misma categoría,
  excluye actual, scroll-snap, flechas ‹› desktop con disabled) y
  **`RecentlyViewed.tsx`** (snapshot en localStorage `emanella-recently-viewed`,
  máx. 10, oculto sin historial). Los componentes de perfume no renderizan sin datos
  → seguros antes y después de la migración.
- **Sobre nosotros**: historia oficial de la marca + valores con vocabulario real.
- **AddCartSection**: "Añadir a la bolsa" → **"Agregar al carrito"** (consistencia) y
  abre el drawer al agregar.

## Fase 5 (parcial)

- **Checkout**: resumen del pedido en **panel grafito** (`#2A2330`) con total en
  champán y botón dorado — paridad con el branding del checkout de Shopify.
- Wompi: **bloqueado por llaves** (ver "Bloqueantes").

## Fase 6 (parcial)

- Auditoría completa de los 11 flujos (hallazgos en `docs/03-spec-automatizaciones.md`).
- **Fix aplicado**: `cart-recovery-step-1/2/3.json` usaban `localhost:3000` (falla con
  n8n en Docker) → unificados a `host.docker.internal:3000`. **Hay que reimportarlos
  en n8n** para que el cambio aplique.

## Fase 4 (preparada, bloqueada)

- `prisma/schema.prisma`: `Product` ampliado con `notasSalida/notasCorazon/notasFondo/
  concentracion/familia/duracion/inspiradoEn/genero` (todos opcionales, no destructivo).
- **`prisma db push` fue bloqueado por el clasificador de permisos** (migración contra
  Neon producción requiere aprobación explícita). El código escrito tolera ambos
  estados (campos undefined → componentes no renderizan).
- ⚠️ **No correr `npm install` ni `npm run build` antes de aprobar la migración**:
  regenerarían el cliente Prisma con las columnas nuevas y las queries fallarían
  contra Neon sin migrar.

## Verificación

- `npx tsc --noEmit` limpio. `npm run lint`: 7 errores **preexistentes** (admin/api
  viejos), ninguno en archivos tocados.
- Preview verificado: home (todas las secciones), catálogo desktop 5 col, PDP
  (carrusel con productos reales), carrito, checkout, sobre-nosotros, drawer
  (agregar desde card → ítem correcto → drawer), móvil 375px.

## Bloqueantes para Steven

1. **Migración Neon**: aprobar/ejecutar `npx prisma db push` (agrega columnas nullable).
2. **Wompi**: llaves pública + secreto de eventos (Fase 5).
3. **WhatsApp Cloud API**: `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` (Fase 6).
4. **Rotar `N8N_SECRET`** (está hardcodeado en los JSON del repo) y reimportar flujos.

Sin commits (regla 1).
