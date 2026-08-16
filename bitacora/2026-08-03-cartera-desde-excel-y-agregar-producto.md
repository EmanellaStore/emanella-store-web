# Bitácora — 2026-08-03 · Cartera lee del Excel + agregar producto al inventario

Steven: la cartera dependía del catálogo de Neon para buscar productos, mientras
el inventario depende del Excel. Pidió que **ambos dependan del Excel**, y además
una función para **agregar un producto nuevo** desde el inventario que escriba el
Excel por detrás.

## A) La cartera busca en el Excel (no en Neon)

- `buscarProductosCatalogo(q)` (en `cartera.service.ts`) ahora lee del Excel vía
  `getInventario()` en vez de `db.product`. Filtra por palabras del nombre, ordena
  "en stock primero", y devuelve nombre + precio detal + stock.
- Caché en memoria de 60s (`inventarioParaBuscar`) para no golpear el Apps Script
  en cada tecla. `invalidarCacheInventario()` lo limpia al crear un producto.
- Los ítems de venta ya no traen productId/variantId de Neon (quedan null; el
  modelo `CarteraVentaItem` ya los tenía opcionales). El precio sigue editable.
- `NuevaVentaForm`: `ProductoSugerido` admite null; `key` del ítem hecho único.

## B) Agregar producto nuevo (escribe el Excel)

- **Apps Script** (`scripts/inventario-apps-script.gs`): nueva acción `append` que
  inserta una fila al final de la tabla principal, **copia las fórmulas y el
  formato de la fila de arriba** (Stock Disponible, Inversión, Ganancias, Utilidad),
  limpia las columnas de entrada y llena solo los campos recibidos (ventaDetal=0).
  → **Requiere redeploy del script** (nueva versión, misma URL).
- `google-sheets.ts`: `agregarFila(valores)` → acción `append`.
- `inventario.service.ts`: `agregarProducto(datos)` valida y arma los valores.
- `api/inventario/route.ts`: `POST` para crear; invalida el caché de la cartera.
- `NuevoProducto.tsx`: modal con nombre, tipo (Men/Women/Unisex), stock inicial,
  3 precios y estado. Botón "+ Nuevo producto" en `InventarioLista`.

## C) Cada venta de la cartera descuenta en el Excel (Venta Detal)

- `inventario.service.ts`: `descontarPorVenta(lineas)` empareja cada ítem con la
  tabla por nombre normalizado, agrupa por fila (si el producto va en dos líneas)
  y escribe `ventaDetal + cantidad`. La fórmula del Excel baja el Stock Disponible.
  Los ítems de texto libre que no existen en el inventario se devuelven en
  `sinCoincidencia` y no rompen nada.
- `api/cartera/ventas/route.ts` (POST): tras crear la venta llama a
  `descontarPorVenta` en **best-effort** — si el Apps Script falla, la venta queda
  registrada igual y el error solo se loguea. Invalida el caché del inventario.

## Verificación (dev, datos reales)

- `npx tsc --noEmit`: 0 errores en `src/`.
- Cartera → nueva venta → "yara": devuelve Yara Candy/Elixir/Moi/Rosada/Tous del
  **Excel**, con "N en stock" y precio $150.000. Al agregar Yara Moi, el precio se
  prellena en 150. Sin errores de servidor.
- Inventario → "Nuevo producto": el modal abre con todos los campos; validación de
  nombre vacío funciona. El guardado real queda pendiente del **redeploy del Apps
  Script** (la versión desplegada aún no tiene `append`).

- **Descuento por venta (C):** venta de prueba de 1× "Yara Moi" vía
  `POST /api/cartera/ventas` → respuesta `inventario: {descontados: 1,
  sinCoincidencia: []}`; en el Excel Venta Detal pasó de 0 a 1 y el stock de 2 a 1.
  Después se revirtió todo: se eliminó el cliente de prueba (y su venta en
  cascada) y se devolvió la fila 117 a `ventaDetal: 0` → `stock: 2`. Verificado
  releyendo el Excel.

Pendiente: (1) Steven redespliega el Apps Script para activar "agregar producto";
(2) commit/push a develop.
