# Bitácora — 2026-07-09 · Categorías: solo perfumería (por ahora)

Decisión de Steven: la tienda muestra únicamente perfumería; bolsos, accesorios
y zapatos quedan **comentados** (no borrados) para reactivarlos más adelante.

## Cambios

- `src/app/catalogo/page.tsx`: `validCategories` deja solo `"perfumes"`;
  las otras tres quedan comentadas en el arreglo.
- `src/types/product.ts`: en `CATEGORIES` (alimenta el select del admin) quedan
  Perfumes y Combos Especiales; bolsos/accesorios/zapatos comentados.
- `src/app/layout.tsx`: description del sitio → copy de perfumería
  ("Perfumería original y alternativas 1.1…").
- El validador Zod y el tipo `Category` **siguen aceptando** los valores viejos
  para no romper datos existentes (la restricción es solo de UI).

## Verificación

- DB revisada: solo hay `perfumes` (99) y `combos` (1) — nada quedó huérfano.
- Preview: chips del catálogo = Todos · perfumes · hombre · dama · unisex.
- `npx tsc --noEmit` limpio.

Para reactivar una categoría: descomentar su línea en `validCategories`
(catálogo) y en `CATEGORIES` (admin). Sin commits.
