# Bitácora — 2026-07-07 · Fase 0: Diagnóstico y documentación

## Qué se hizo

- **Escaneo completo** de `emanella-store-web` (Next.js 16, React 19, Prisma 6 +
  Neon, Tailwind v4, Zustand, 11 flujos n8n en `src/flows/`) y del proyecto
  `emanella-shopify` (solo lectura): CLAUDE.md, docs de marca, bitácoras de las
  10 sesiones completadas del tema Dawn personalizado.
- **Diagnóstico clave:** el proyecto Next.js usa el tema oscuro violeta con
  Cormorant Garamond — dirección **descartada** en Shopify. La dirección final en
  producción es **"Lila Polvo"** (pastel claro, Fraunces + Jost, champán como acento).
- **Brecha de datos:** el modelo `Product` no tiene campos de perfumería
  (notas olfativas, concentración, familia, etc.) que la PDP de Shopify usa.
- **Brecha de canal:** los flujos n8n hoy notifican por Telegram; el objetivo es
  WhatsApp API. n8n corre en localhost → no funcionará en producción (Vercel)
  sin hosting propio.

## Archivos creados

- `CLAUDE.md` — contrato de trabajo (reglas: no commit sin autorización, carpeta
  Shopify solo lectura, bitácora por sesión).
- `PLAN.md` — plan maestro en 7 fases (28 pasos) + 4 decisiones pendientes (D1–D4).
- `CHECKS.md` — checklist de avance por paso.
- `docs/00-marca-y-diseno.md` — tokens Lila Polvo adaptados a Tailwind v4.
- `docs/01-spec-ui-paridad.md` — spec página por página (home, PLP, PDP, carrito,
  checkout, footer, navbar).
- `docs/02-spec-datos.md` — cambios de schema Prisma propuestos (no destructivos).
- `docs/03-spec-automatizaciones.md` — auditoría de flujos + plan WhatsApp Cloud
  API + recomendación de hosting n8n.

## Sin cambios de código ni de base de datos en esta fase. Sin commits.

## Próximo

- Respuestas del usuario a D1–D4 (pagos Wompi, proveedor WhatsApp, hosting n8n,
  fuente de datos de perfume).
- Arrancar **Fase 1** (tokens + Fraunces) tras el visto bueno.
