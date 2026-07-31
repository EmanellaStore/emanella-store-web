# Bitácora — 2026-07-08 (sesión 3) · Imágenes del tema Shopify replicadas

Pedido de Steven: usar las mismas imágenes de Shopify (hero y banners) para que
las páginas queden iguales.

## Origen de las imágenes (verificado)

- `templates/index.json` del tema: hero = `emanella-home-hero.png`, historia =
  `emanella-home-historia.png`; la sección "categorias" (collection-list) toma
  la imagen de las colecciones `hombre`/`dama`/`unisex`.
- URLs reales obtenidas vía MCP GraphQL (`collections.image.url` + `files`) y
  descargadas del CDN de Shopify (las mismas del sitio en vivo, no las variantes
  locales de `generated-images/`).

## Archivos agregados a `public/`

| Archivo | Uso | Fuente |
|---|---|---|
| `home-hero.png` (1376×768) | Hero del home | `files/emanella-home-hero.png` |
| `home-historia.png` | Sección historia | `files/emanella-home-historia.png` |
| `cat-hombre.png` / `cat-dama.png` / `cat-unisex.png` (1024²) | Cards "Encuentra el tuyo" | imágenes de las colecciones |
| `sobre-nosotros.png` | Página Sobre nosotros | copia de `emanella-shopify/generated-images/` (misma subida a Shopify Files) |
| `logo-emanella.png` / `logo-emanella-white.png` | reservadas (logo del tema) | `files/` |

## Cambios de código

- `HeroSection.tsx`: `/hero-banner.png` → `/home-hero.png`; overlay suavizado
  (la imagen ya es lila polvo; solo un degradado ligero para legibilidad).
- `page.tsx` (home):
  - "Encuentra el tuyo": cards tipográficas → **cards con imagen** (cuadradas,
    sharp, borde hairline, zoom al hover) + título Fraunces itálica + tagline +
    "Explorar →", como el collection-list de Shopify.
  - Historia: pirámide decorativa → **image-with-text** con `home-historia.png`
    + botón ghost "Conócenos →" (paridad con la sección de Shopify; la pirámide
    olfativa sigue viva en la PDP, que es su lugar).
- `sobre-nosotros/page.tsx`: imagen editorial 16:10 al inicio.

## Verificación (preview)

- Hero: botella champán con pétalos + titular a la izquierda — idéntico a Shopify. ✔
- Categorías: Hombre (ámbar/maderas) · Dama (rosas) · Unisex (verde/blanco). ✔
- Historia: tocador con perfumes + texto y CTA. ✔
- Sobre nosotros: imagen editorial arriba. ✔
- Sin referencias residuales a `hero-banner.png` ni a las cat-* viejas.

## Logos (pedido posterior de Steven)

- `Navbar.tsx`: logo de texto "Emanella Store" → imagen `logo-emanella.png`
  (monograma EA + wordmark, versión oscura) con `priority`, h-11/h-12.
- `Footer.tsx`: logo de texto → `logo-emanella-white.png` (versión blanca sobre
  grafito), h-12/h-14.
- Verificado en preview: navbar clara y footer grafito con sus versiones correctas.

## Nota de entorno

La ventana del preview a veces reporta viewport 0×0 y los screenshots/lazy-load
se cuelgan; se resolvió forzando `preview_resize 1280×800`. No es un bug de la app.

Sin commits (regla 1).
