# Bitácora — 2026-10-02 · El naranja va en Stock Disponible

Steven: cuando la app pasa un producto a "Se debe volver a comprar", la casilla
de **Stock Disponible** queda en 0 pero no se pone naranja (como en "Kayali
Set"). Varios productos cambiaron de estado sin que les cambiara el color.

## Causa

Al construir el marcado automático (2026-08-20) se supuso que el naranja iba en
la casilla de **Estado**, y solo se pintaba esa. El naranja de Steven va en la
casilla de **Stock Disponible**. No se comprobó en el Excel real en ese momento.

## Qué se hizo (`scripts/inventario-apps-script.gs`)

- `marcarEstados` pinta **Estado y Stock Disponible**. Sin colores hardcodeados:
  se toma la **moda** (el color más repetido) del Excel.
- Nueva acción `colores` (solo lectura): estado, stock y color de cada fila.
- `mapearColumnas` reconoce "Stock Disponible"; helpers `ubicarTabla` y `moda`.
- `google-sheets.ts` → `leerColores()`.
- `scripts/marcar-agotados.ts --repintar`.

## Primera versión descartada antes de aplicarla

La primera versión tomaba el color más repetido **entre las filas con el mismo
estado**. Antes de repintar se leyeron los colores reales con `colores` (145
filas) y se vio que la regla del Excel es otra: **el color de Stock Disponible
depende del stock, no del estado**.

| Stock Disponible | Color de la casilla |
| --- | --- |
| "En stock" con unidades | verde `#93c47d` en 84 de 86 |
| "Temporalmente no disponible" en 0 | naranja `#ff6d01` en las 44 |
| "Se debe volver a comprar" en 0 | 8 verdes, 5 naranja `#ff6d01`, 1 `#ff9900` (Kayali Set) |

Las 8 verdes son las que la app marcó cuando solo pintaba Estado (conservaron el
verde de cuando tenían stock). Con la primera versión ganaba el verde (8 contra
6) y `--repintar` las habría dejado **todas en verde**.

## Versión final

- Color de **Stock Disponible**: moda entre **todas** las filas en la misma
  condición de stock (en 0 → naranja, 49 de 58; con unidades → verde), sin las
  filas del lote.
- Color de **Estado**: moda entre las filas con ese mismo estado (sin las que
  están cambiando de estado).
- `--repintar` solo toca agotadas en 0 cuya casilla sigue en el color de "con
  unidades" (verde). No toca colores puestos a mano (Kayali Set `#ff9900`).

## Verificación

- Sintaxis del `.gs` validada.
- Simulación con los **colores reales** de las 145 filas: las 8 verdes → naranja
  `#ff6d01`; Kayali Set intacta; un producto que se agota → naranja; vuelve a
  tener stock → verde.
- Segundo redespliegue → `--repintar` sobre las 8 verdes: **4 quedaron naranja**
  (Club de nuit Woman, Hawas Elixir, Odyssey Candee, Ombre Nomade) y **4 no**
  (Lion Heart Men 40, Lion Heart Women 41, Invictus 55, Paris Hilton 97). El
  script respondía `pintadas: 1` con `#ff6d01`, pero al releer seguían en verde,
  también en la vista de Steven.
- Revisión en el Excel: sin rangos protegidos y sin formato condicional en la
  columna D. Al revisar, se guardó sin querer una regla "La celda no está vacía →
  verde" sobre D40; Steven la borró y pintó D40 a mano en naranja.
- Tercer `--repintar` (sin cambios de código ni redespliegue): pintó las 3
  restantes. Lectura final: las **14 agotadas en 0** están en naranja (13
  `#ff6d01` + Kayali Set `#ff9900`, puesto a mano).
- **No se identificó** por qué esas 4 celdas no aceptaron el color en el primer
  intento; en el siguiente intento lo aceptaron sin cambios. Si un producto que
  se agote no queda en naranja, revisar ese caso con la acción `colores`.

## El inverso: de naranja a verde cuando vuelve a haber stock

Steven: casillas naranjas con stock, reabastecidas desde la app (filas 42 y 85).

**Causa.** `actualizarProducto` (guardar en el inventario de la app) escribía el
stock pero nunca revisaba el color. Solo las devoluciones de la cartera
repintaban, y únicamente cuando además cambiaba el estado.

**Qué se hizo.**
- `actualizarProducto`: lee la fila antes de guardar; si el stock cruza el 0 (en
  cualquier sentido), llama a `marcarEstados` con el estado guardado para
  repintar.
- `ajustarVentaDetal` (ventas y devoluciones de la cartera): si el stock cruza el
  0 y el estado no cambia (p. ej. "Temporalmente no disponible", o un agotado con
  unidades que se vende), igual se repinta.
- `EditorProducto`: al subir el stock inicial de un agotado y quedar con
  unidades, preselecciona "En stock" (inverso de `registrarVenta`).
- `marcar-agotados.ts --repintar`: también repinta "En stock" con unidades cuya
  casilla sigue en el color de "en 0".

**Verificación (Excel real).**
- `--repintar`: filas 42 (Club de Nuit Oud Women) y 85 (Moshino toy 2 Blank) →
  verde.
- Prueba con Odyssey Candee Armaf (fila 117), revertida al final:
  - Inventario +1 stock → `En stock`, verde. Vuelve a 0 → `Se debe volver a
    comprar`, naranja.
  - Cartera: devolución de 1 → `En stock`, verde. Se vuelve a vender → agotado,
    naranja.
  - Final idéntico al inicio (stock 0, inicial 2, venta detal 2, mismo estado).
- Revisión de toda la hoja: todas las casillas siguen "verde con unidades /
  naranja en 0", salvo dos excepciones dejadas a propósito: 360 Men (fila 7,
  "Temporalmente no disponible" con 4 unidades, naranja) y Kayali Set (fila 75,
  `#ff9900` puesto a mano).

## Nota aparte (Santal 33)

Steven confirmó que bajó la Venta Detal de 2 a 1: hubo un **descuento doble** en
esa venta (una sola línea en la cartera, 1 unidad). Decidió dejarlo así; si se
repite, hay que investigar el origen.
