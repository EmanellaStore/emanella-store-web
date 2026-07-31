# PLAN — Migración del diseño y paridad Shopify → Next.js

> Objetivo: que `emanella-store-web` se vea y se comporte igual que
> https://emanellastore.com/ (Shopify, dirección "Lila Polvo"), con e-commerce
> 100% funcional y automatizaciones n8n + WhatsApp operativas.
> Avance se marca en `CHECKS.md`. Cada fase cierra con entrada en `bitacora/`.

---

## Fase 0 — Diagnóstico y documentación ✅ (2026-07-07)

- Escaneo completo de ambos proyectos, creación de CLAUDE.md, PLAN, CHECKS,
  specs (`docs/`) y bitácora.

## Fase 1 — Sistema de diseño (tokens + tipografía)

1. Reemplazar tokens en `src/app/globals.css` (`@theme` de Tailwind v4) por la
   paleta Lila Polvo (ver `docs/00-marca-y-diseno.md`).
2. Sustituir `@fontsource/cormorant-garamond` por `@fontsource/fraunces`
   (mantener Jost). Actualizar `--font-serif`/`--font-sans` y `package.json`.
3. Crear utilidades/base: eyebrow con guiones, hairline champán, botón primary
   (grafito) y ghost (border-bottom champán), estilos de precio (Fraunces 600,
   champán hondo).
4. Verificación visual con dev server (light, contraste AA, móvil).

## Fase 2 — Componentes de tienda

5. `Navbar` — Jost uppercase tracking amplio, fondo lila, anuncio superior.
6. `ProductCard` — estilo Amelie: sharp (sin radius), fondo `bg-card`, borde
   hairline, hover zoom 1.03 + barra oscura slide-up "Agregar al carrito" con
   stepper [− 1 +], badge descuento grafito, precio champán, 2ª imagen al hover.
7. `Footer` — grafito oscuro `#2A2330`, compacto, columnas marca/tienda/contacto,
   sin huecos vacíos.
8. `HeroSection` y secciones del home.
9. Carrito: drawer lateral (hoy es página) con spinner, "Ver carrito" y
   "Finalizar compra" — paridad con el drawer de Shopify.

## Fase 3 — Páginas (paridad con Shopify)

10. **Home**: hero "Que te recuerden por cómo hueles" → categorías (Hombre/Dama/
    Unisex) → "Los más deseados" → "Recién llegados" → trust bar (4 ítems) →
    historia → newsletter. Copy exacto en `docs/00-marca-y-diseno.md` §microcopy.
11. **PLP** (`/catalogo`): header editorial (eyebrow + Fraunces + hairline),
    filtros horizontales arriba, grid ancho 5 columnas desktop.
12. **PDP** (`/producto/[slug]`): galería, pirámide olfativa (salida·corazón·fondo),
    ficha técnica en chips (concentración/familia/duración/inspirado en), CTA
    WhatsApp verde premium, acordeón "Envíos y entregas", carrusel "También te
    pueden gustar" + "Vistos recientemente" (localStorage).
13. Páginas legales y "Sobre nosotros" con el vocabulario profesional de Shopify.
14. `/ofertas`, `/gracias`, `/track`, `/resena` re-estilizadas con los tokens.

## Fase 4 — Datos (Neon + Prisma)

15. Ampliar `Product` con campos de perfumería: `notasSalida`, `notasCorazon`,
    `notasFondo`, `concentracion`, `familia`, `duracion`, `inspiradoEn`, `genero`
    (spec en `docs/02-spec-datos.md`). `prisma db push` a Neon tras confirmación.
16. Actualizar servicios/validadores/admin (ProductForm) para los campos nuevos.
17. Poblar datos de perfumería de los productos existentes (fuente: Shopify
    metafields `perfume.*` vía MCP, o manual — decidir con el usuario).

## Fase 5 — Checkout y pagos

18. Re-estilizar checkout con la marca (paridad con branding del checkout Shopify).
19. **Decisión de usuario pendiente:** integrar Wompi como pasarela (como en
    Shopify) o mantener método actual. Si Wompi: widget/redirect + webhook de
    eventos + flujo `payment-confirmation.json`.
20. Verificar flujo completo: carrito → checkout → orden → inventario → webhook
    n8n → confirmación.

## Fase 6 — Automatizaciones (n8n + WhatsApp)

21. Auditar los 11 flujos de `src/flows/` contra las APIs reales del proyecto
    (endpoints, tokens, URLs por entorno).
22. Migrar el canal de salida de Telegram → **WhatsApp API** (decisión de
    proveedor pendiente: Meta Cloud API directa vs. Evolution/360dialog —
    ver `docs/03-spec-automatizaciones.md`).
23. Importar/actualizar flujos en n8n local (http://localhost:5678) y probar
    end-to-end: carrito abandonado, lifecycle de orden, welcome, winback,
    review request, repurchase, chatbot.
24. Plan de producción: n8n local no corre cuando la app está en Vercel —
    definir hosting (VPS/Railway/n8n cloud) o migrar jobs a Vercel Cron.

## Fase 7 — QA final y cierre

25. Recorrido completo de compra en móvil y desktop.
26. Accesibilidad (contraste AA, focus visible, reduced motion).
27. Lighthouse/perf básico; revisar Meta Pixel + CAPI ya integrados.
28. Bitácora final + checklist 100%.

---

## Decisiones del usuario (resueltas 2026-07-07)

| # | Decisión | Respuesta |
|---|----------|-----------|
| D1 | Pasarela de pago | **Sí, integrar Wompi** (pedir llaves en Fase 5) |
| D2 | WhatsApp API | **Meta Cloud API oficial** (pedir número Business + tokens en Fase 6) |
| D3 | Hosting n8n producción | **Seguir local por ahora**; resolver antes del lanzamiento |
| D4 | Datos de perfumería | **Importar de Shopify** (metafields `perfume.*` vía MCP) |
