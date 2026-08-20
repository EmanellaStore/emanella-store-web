# Bitácora — 2026-08-20 · Los agotados se marcan solos

Steven: cuando una venta de la cartera deja un producto en Stock Disponible 0,
que quede marcado de una vez como **"Se debe volver a comprar"** y que la casilla
del Excel quede en el mismo naranja que las otras filas agotadas. Casos vistos:
Khamrah, Paris Hilton Heiress (Invictus y Moshino Blank ya estaban bien).

## Qué se hizo

- `lib/inventario.ts`: constante `ESTADO_AGOTADO`.
- `inventario.service.ts` → `descontarPorVenta`: después de sumar a Venta Detal
  calcula el stock resultante con `calcularStock`; si queda ≤ 0 y el estado aún
  no es el de agotado, lo escribe. Devuelve `agotados: number[]` (las filas
  marcadas). Solo escribe si el estado **cambia**.
- `marcarEstados(updates, colEstado)`: nuevo helper con degradado — usa la acción
  `estado` del script (texto + color) y, si el script desplegado no la conoce,
  cae a `escribirCeldas` (texto sin color) en vez de fallar.
- **Apps Script** (`marcarEstados`): escribe el estado y **copia el fondo y el
  color de letra de otra fila que ya tenga ese mismo estado**. Sin colores
  hardcodeados: si mañana cambian el naranja, se copia el nuevo. Va en los dos
  sentidos (si vuelve a "En stock", copia el formato de las que están en stock).
  → **Requiere redeploy del script.**
- `EditorProducto`: el botón "+" de ventas ahora usa `registrarVenta()`, que si la
  venta deja el stock en 0 preselecciona el estado de agotado (editable antes de
  guardar).
- `scripts/marcar-agotados.ts`: arregla de una vez los que ya están en 0 sin
  marcar. **No toca los "Temporalmente no disponible"** — esos están en 0 a
  propósito, no por una venta (hay ~50 así en la hoja).

## Verificación (dev, datos reales)

- `npx tsc --noEmit`: 0 errores en `src/`.
- Venta de prueba de 1× "Asad Zanzibar" (fila 24, stock 1 → 0):
  respuesta `{descontados: 1, sinCoincidencia: [], agotados: [24]}`; al releer el
  Excel la fila quedó `stock: 0, estado: "Se debe volver a comprar"`.
- Sondeo directo al script desplegado con `action: "estado"` → `accion
  desconocida`: confirma que la versión en producción es la vieja y que el
  degradado a texto-sin-color funcionó.
- Revertido: cliente de prueba eliminado y fila 24 devuelta a
  `ventaDetal: 1, estado: "En stock", stock: 1` (releído del Excel).

Pendiente: Steven redespliega el Apps Script (activa de una vez `append` para
"Nuevo producto" y `estado` para el color); después se corre
`npx tsx scripts/marcar-agotados.ts` para Khamrah (62), Paris Hilton Heiress (97)
y Lattafa Shaheen Silver (127).
