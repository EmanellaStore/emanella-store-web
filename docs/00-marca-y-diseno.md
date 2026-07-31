# 00 · Marca y diseño — "Lila Polvo" (portado de Shopify)

Fuente de verdad original: `emanella-shopify/docs/00-marca-y-diseno.md` (solo lectura).
Este archivo adapta esa dirección al stack Next.js + Tailwind v4.

## Paleta — tokens para `@theme` en `globals.css`

| Token propuesto | Hex | Uso |
|---|---|---|
| `--color-bg-primary` | `#ECE6F0` | Fondo principal (lila polvo) |
| `--color-bg-secondary` | `#E1D8E8` | Secciones alternas |
| `--color-bg-card` | `#F7F4FA` | Cards ("blanco" lila-nácar) |
| `--color-ink` | `#332B3A` | Texto principal (AAA) |
| `--color-ink-soft` | `#5F5568` | Texto secundario (AA) |
| `--color-accent` | `#B0915F` | Champán: hairlines, eyebrows, hover |
| `--color-accent-deep` | `#8A6A3C` | Champán hondo: texto/precios (AA) |
| `--color-line` | `#DED4E6` | Bordes/hairlines |
| `--color-ink-deep` | `#2A2330` | Botones primarios, footer, badges |
| `--color-on-dark` | `#F2EFF6` | Texto sobre `ink-deep` |

Prohibido: `#FFFFFF`, `#000000`, grises fríos. Nota de migración: hoy `globals.css`
usa nombres legacy (`--color-cream`, `--color-gold`, `--color-cacao`…) con el tema
oscuro descartado. Estrategia: **mantener los nombres legacy apuntando a los valores
nuevos** durante la transición (los componentes ya los usan) e ir renombrando por fase.

## Tipografía

- Display: **Fraunces** (`@fontsource/fraunces`) — H1 44–72px w500, H2 30–40px w500.
- Texto/UI: **Jost** — body 14–16px w300–400; navegación 11–13px, tracking 0.18em, UPPERCASE.
- Precios: Fraunces recta w600, color `--color-accent-deep`.
- Eliminar Cormorant Garamond (descartada: "serif por defecto de IA").

## Firma de marca

1. **Pirámide olfativa** (salida · corazón · fondo) en PDP y como motivo editorial.
2. **Hairline champán vertical** (1px) anclando títulos de sección.
3. **Eyebrows con guiones**: `— LOS MÁS DESEADOS —`, uppercase, tracking amplio, champán.

Regla de restricción: la audacia va en un solo lugar — botones y footer en grafito
oscuro; el resto respira en pastel.

## Componentes

- **Cards de producto:** sin border-radius. Fondo `bg-card`, borde 1px `line`.
  Hover: zoom imagen `scale(1.03)` `.4s` + barra oscura slide-up con "Agregar al
  carrito" y stepper [− 1 +]; clic en foto → PDP; 2ª imagen al hover; badge de
  descuento grafito; precio oferta champán hondo + anterior tachado; título a 2
  líneas fijas + min-height del precio (alineación entre cards).
- **Botones:** primary = `ink-deep` + `on-dark`; ghost = texto ink + border-bottom
  champán ("Ver colección →"); WhatsApp = verde premium (degradado + sombra).
- **Animación:** fade-in en hero, reveal on-scroll discreto, respetar
  `prefers-reduced-motion`.

## Microcopy oficial (home)

- Hero H1: `Que te recuerden por cómo hueles`
- Hero sub: `Perfumería original y alternativas 1.1 de alta fidelidad, elegidas una a una. Calidad de autor a un precio que sí tiene sentido.`
- CTAs hero: `Explorar la colección` · `Lo nuevo`
- Categorías: `Encuentra el tuyo` (Hombre · Dama · Unisex)
- Best sellers: `Los más deseados` · Novedades: `Recién llegados`
- Trust bar: `Realizamos envíos a toda Colombia con guía de rastreo` · `Originales y 1.1 de verdad` · `Confirmamos cada pedido por WhatsApp` · `Paga con tranquilidad`
- Historia H1: `El buen perfume, al alcance de tu piel` (párrafo completo en doc original)
- Newsletter: `Entra al círculo Emanella`

Voz: activa, sentence case, español Colombia. "Agregar al carrito" → confirmación "Agregado".
