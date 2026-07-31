# CLAUDE.md — Emanella Store Web (Next.js)

> Contrato de trabajo del proyecto. La arquitectura técnica vive en @AGENTS.md.
> El plan maestro está en `PLAN.md`, el avance en `CHECKS.md`, las especificaciones
> en `docs/` y el historial de cambios en `bitacora/`.

---

## 1. Misión actual

Replicar en este proyecto Next.js el **estilo, comportamiento y funcionalidades**
de la tienda Shopify en producción (https://emanellastore.com/), al 100%:

- Dirección visual **"Lila Polvo"** (pastel premium editorial) — reemplaza el tema
  oscuro violeta actual. Tokens y reglas en `docs/00-marca-y-diseno.md`.
- Paridad funcional de e-commerce: home, catálogo (PLP), producto (PDP con pirámide
  olfativa), carrito, checkout, órdenes. Spec en `docs/01-spec-ui-paridad.md`.
- Datos: Neon PostgreSQL vía Prisma. Cambios de schema en `docs/02-spec-datos.md`.
- Automatizaciones: n8n (local, http://localhost:5678) + WhatsApp API.
  Spec en `docs/03-spec-automatizaciones.md`.

## 2. Reglas de trabajo (SIEMPRE)

1. **NUNCA hacer `git commit` ni `git push` sin autorización explícita del usuario.**
2. **NUNCA modificar nada dentro de `D:\DATOS\Documents\EmanellaStore\emanella-shopify`**
   — es solo lectura (referencia y comparación). Ejecutar/leer sí; escribir jamás.
3. Cada cambio relevante se registra en `bitacora/` (un archivo por sesión, con fecha).
4. Cada paso completado se marca en `CHECKS.md` solo cuando esté **verificado funcionando**.
5. Plan antes de ejecutar cambios grandes (schema de DB, flujos n8n, checkout):
   presentar plan numerado y esperar confirmación.
6. Cambios de base de datos: usar `prisma db push` contra Neon solo tras confirmar;
   nunca borrar datos existentes sin respaldo/confirmación.
7. Los flujos n8n (`src/flows/*.json`) SÍ se pueden modificar libremente para que
   funcionen correctamente (permiso total del usuario).
8. Idioma con el usuario: **español (Colombia)**. Copy de la tienda: español,
   sentence case, voz activa (ver microcopy en `docs/00-marca-y-diseno.md`).

## 3. Identidad visual (resumen)

- **Dirección:** Lila Polvo — lila empolvado de fondo, grafito-violeta de tinta,
  champán como acento joya. **Se descartó** el tema oscuro actual y Cormorant Garamond.
- **Tipografía:** `Fraunces` (display) + `Jost` (texto/UI). Nunca fuentes de sistema.
- **Prohibido:** `#FFF` puro, `#000` puro, grises fríos, border-radius en cards de
  producto, look "plantilla de IA".
- **Firma de marca:** pirámide olfativa + hairline champán vertical + eyebrows
  con guiones (`— BEST SELLERS —`).
- Contraste AA obligatorio. Respetar `prefers-reduced-motion`.
- Al construir UI usar la skill `frontend-design`.

## 4. Referencias

- Tienda Shopify en vivo: https://emanellastore.com/
- Proyecto Shopify (solo lectura): `D:\DATOS\Documents\EmanellaStore\emanella-shopify`
  - Diseño: `docs/00-marca-y-diseno.md` · Bitácoras: `sesiones/completadas/`
  - Tema Dawn personalizado: `emanella-theme/` (CSS de referencia: `assets/emanella.css`)
- Estado histórico de este proyecto: `ESTADO_ACTUAL_PROYECTO.md` (2026-04-27, pre-migración).
