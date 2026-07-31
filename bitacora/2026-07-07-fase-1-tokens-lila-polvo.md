# Bitácora — 2026-07-07 · Fase 1: Sistema de diseño Lila Polvo

## Decisiones del usuario registradas (D1–D4)

- D1: **Sí integrar Wompi** en el checkout (Fase 5).
- D2: **Meta WhatsApp Cloud API oficial** como canal (Fase 6).
- D3: n8n **sigue local** por ahora; hosting se resuelve antes del lanzamiento.
- D4: Datos de perfumería **se importan de Shopify** (metafields `perfume.*`).

## Cambios realizados

1. **`package.json`**: `@fontsource/fraunces` instalada; `@fontsource/cormorant-garamond`
   eliminada.
2. **`src/app/globals.css`** reescrito:
   - Tokens legacy (`cream/beige/gold/cacao/warm-black…`) remapeados a la paleta
     Lila Polvo — esto re-estiliza toda la app de una vez porque los componentes
     solo usan tokens (verificado: único hex hardcodeado era el verde de WhatsAppButton).
   - Tokens canónicos nuevos agregados (`bg-primary/bg-card/ink/accent/on-dark…`).
   - `--font-serif` → Fraunces. Utilidades `.eyebrow` y `.hairline-v`.
   - Bloque `prefers-reduced-motion`.
3. **Correcciones de inversión de roles** (texto que era claro en el tema oscuro
   quedaba oscuro-sobre-oscuro, o claro-sobre-champán sin contraste):
   - `Footer.tsx`: `text-cacao*` → `text-on-dark*` sobre el grafito.
   - Global: `bg-gold text-cream` → `bg-warm-black text-on-dark` (los botones
     primarios son grafito según la marca; champán solo para detalles). Afectó:
     carrito, catálogo, contacto, gracias, resena, admin (orders/products/ProductForm).
   - `app/page.tsx`: CTA `bg-cacao text-warm-black` → `text-on-dark`.
   - `AdminSidebar.tsx`: `text-cacao` → `text-on-dark`.
   - `ToastContainer.tsx`: círculo del check `bg-gold` → `bg-warm-black`.
4. **`.claude/launch.json`** creado (dev server para previews).

## Verificación

- Dev server (`npm run dev`, previa limpieza de `.next` por caché de Turbopack
  que retenía los imports de Cormorant).
- Home desktop: fondo lila polvo, tinta grafito-violeta, Fraunces en titulares,
  champán en logo/acentos. ✔
- Footer: texto `#F2EFF6` sobre `#2A2330` (inspeccionado por computed style). ✔
- Catálogo: header editorial, chips de filtro, botón Buscar grafito. ✔
- Móvil (375px): hero, CTAs y navbar correctos. ✔

## Notas

- Los componentes conservan su estructura vieja (copy "Descubre tu esencia
  perfecta", secciones del home antiguas): la paridad de estructura/copy con
  Shopify es Fase 2–3.
- El catálogo tiene categorías más allá de perfume (bolsos, accesorios, zapatos)
  — confirmar con el usuario cómo mapean a Hombre/Dama/Unisex de Shopify.
- Sin commits (regla 1). Sin cambios en DB ni en flujos n8n.
