# CHECKS — Avance de la migración

> Marcar `[x]` solo cuando el paso esté **verificado funcionando** (no solo escrito).
> Numeración = pasos de `PLAN.md`.

## Fase 0 — Diagnóstico y documentación
- [x] Escaneo de ambos proyectos + creación de CLAUDE.md, PLAN, CHECKS, specs y bitácora (2026-07-07)

## Fase 1 — Sistema de diseño
- [x] 1. Tokens Lila Polvo en `globals.css` (2026-07-07, verificado en dev server)
- [x] 2. Fraunces instalada y reemplazando a Cormorant Garamond (2026-07-07)
- [x] 3. Utilidades base (`.eyebrow`, `.hairline-v`) + botones primarios corregidos a grafito (2026-07-07)
- [x] 4. Verificación visual desktop + móvil; footer y combos oscuro-sobre-oscuro corregidos (2026-07-07). AA fino por página queda en Fase 7.

## Fase 2 — Componentes
- [x] 5. Navbar (tracking 0.18em, badge grafito, menú móvil agregado — antes no existía) (2026-07-08)
- [x] 6. ProductCard estilo Amelie (sharp, barra oscura hover con stepper, badge grafito, precio Fraunces champán, 2ª imagen hover; agregar al carrito verificado en preview) (2026-07-08)
- [x] 7. Footer grafito compacto (marca/Tienda/Legal/Contacto, copy oficial) (2026-07-08)
- [x] 8. HeroSection con copy oficial ("Que te recuerden por cómo hueles") (2026-07-08)
- [x] 9. Carrito drawer (abre desde navbar y al agregar; verificado en preview) (2026-07-08)

## Fase 3 — Páginas
- [x] 10. Home paridad completa: hero → Encuentra el tuyo → Los más deseados (ranking real por ventas) → Recién llegados → trust bar → historia+pirámide → newsletter (2026-07-08)
- [x] 11. PLP `/catalogo`: header editorial, chips categoría+género, grid 5 col, contenedor 1560px (2026-07-08)
- [x] 12. PDP: precio Fraunces, chips ficha técnica, pirámide olfativa, CTA WhatsApp premium, acordeón envíos, carrusel "También te pueden gustar" + "Vistos recientemente" (pirámide/chips renderizan al llegar los datos de perfume) (2026-07-08)
- [x] 13. Sobre nosotros con historia oficial de marca; legales heredan tokens (2026-07-08)
- [x] 14. `/ofertas`, `/gracias`, `/track`, `/resena` re-estilizadas vía tokens + botones corregidos (2026-07-08)

## Fase 4 — Datos
- [x] 15. Schema Product ampliado en Neon (`prisma db push` autorizado y ejecutado; columnas nullable) (2026-07-08)
- [x] 16. Validador Zod + ProductInput + product.service + ProductForm con sección "Perfil olfativo" (tsc limpio) (2026-07-08)
- [x] 17. Datos de perfumería importados de Shopify vía MCP: **100/100 productos** (`scripts/import-perfume-data.ts` + snapshot JSON). Pirámide/chips verificados en PDP y filtro por género en catálogo (34 hombre) (2026-07-08)

## Fase 5 — Checkout y pagos
- [x] 18. Checkout re-estilizado (resumen del pedido en panel grafito + botón champán, paridad branding Shopify) (2026-07-08)
- [x] 19. Wompi integrado con llaves prod del .env: opción en checkout (default), `/api/payments/wompi` (URL firmada, validada con orden real) y `/api/webhook/wompi` (checksum + monto + PENDIENTE→CONFIRMADO + lifecycle). **Pendiente del usuario: registrar el webhook en Wompi y hacer 1 pago real de prueba** (2026-07-08)
- [ ] 20. Flujo de compra end-to-end verificado con pago real (requiere webhook registrado en Wompi)

## Fase 6 — Automatizaciones
- [x] 21. Auditoría de 11 flujos n8n (hallazgos en docs/03) + fix URLs localhost→host.docker.internal en cart-recovery 1/2/3 + **N8N_SECRET rotado** en .env/.env.local y 9 flujos (reimportar en n8n) (2026-07-08)
- [ ] 22. Canal WhatsApp API — **BLOQUEADO: faltan credenciales Meta Cloud API**; guía paso a paso en `docs/04-guia-whatsapp-cloud-api.md`
- [ ] 23. Flujos probados end-to-end en n8n local (tras 22; requiere reimportar JSON corregidos)
- [ ] 24. Plan de producción para automatizaciones (decidido: local por ahora; resolver antes del lanzamiento)

## Extras (fuera del plan original, pedidos por el usuario)
- [x] Imágenes reales del tema Shopify: hero, categorías Hombre/Dama/Unisex, historia, sobre-nosotros (descargadas del CDN, verificadas en preview) (2026-07-08)
- [x] Logos del tema en navbar (oscuro), footer (blanco), sidebar admin y login (2026-07-08)
- [x] Panel admin ampliado estilo Shopify: Inicio (dashboard con ventas/pendientes/stock bajo/top ventas), Inventario (edición de stock inline, probada en vivo), Clientes (búsqueda + WhatsApp), Cupones (crear/activar/desactivar) + sidebar corregido (2026-07-08)
- [x] Login pulido: logo, card sharp, contraste AA, sentence case (2026-07-08)

## Fase 7 — QA final
- [ ] 25. Recorrido completo de compra (móvil + desktop)
- [ ] 26. Accesibilidad AA
- [ ] 27. Perf + Pixel/CAPI verificados
- [ ] 28. Cierre y bitácora final
