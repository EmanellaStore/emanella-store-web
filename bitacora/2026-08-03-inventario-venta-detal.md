# Bitácora — 2026-08-03 · Inventario: registrar ventas (Venta Detal) + fórmula

Steven pidió agregar un campo "Venta Detal" para ir registrando las ventas, que
—como en el Excel— descuente del stock disponible. Y preguntó si su manejo de
"Stock Inicial" está bien o se puede mejorar.

## Hallazgo clave

El **Stock Disponible del Excel es una FÓRMULA**, no un número escrito a mano.
En todas las filas cuadra:

```
Stock Disponible = Stock Inicial − Venta Detal − Venta Mayorista − Regalos
```

Steven lo confirmó. Recomendación sobre el Stock Inicial: **su fórmula está bien,
no cambiar nada en el Excel**. Lo que había que corregir era la app, para que
respete la fórmula en vez de pisarla.

## Corrección importante

La app anterior escribía directo sobre "Stock Disponible" (columna con fórmula),
reemplazándola por un número fijo. En la prueba del día anterior con **Nitro Red**
(2→3→2) le quité la fórmula. **Se restauró** con un script puntual: D86 volvió a
`=E86-G86-J86-N86` (Inicial−VentaDetal−VentaMayorista−Regalos), derivado
dinámicamente de las columnas reales.

## Cambios

- `src/lib/inventario.ts`: `InventarioItem` ahora incluye stockInicial, ventaDetal,
  ventaMayorista, regalos. Nueva `calcularStock()`. `resolverColumnas` mapea las
  columnas nuevas (distingue "venta detal" de "precio detal"). `CampoInventario`
  cambió: se editan `stockInicial` y `ventaDetal` (entradas), ya **no** `stock`.
- `src/services/inventario.service.ts`: parseo de los campos nuevos;
  `actualizarProducto` escribe Stock Inicial / Venta Detal / precios / estado, y
  **nunca** Stock Disponible ni columnas de fórmula.
- `src/app/api/inventario/route.ts`: PATCH acepta stockInicial y ventaDetal.
- `src/components/inventario/EditorProducto.tsx`: Stock Disponible pasa a **solo
  lectura** (se previsualiza en vivo con la misma fórmula). Nuevo stepper "Ventas
  al detal" (el botón + registra una venta, con opción de cantidad) que baja el
  stock. Nuevo stepper "Stock inicial (entradas)" para reabastecer. Precios y
  estado como antes. Todo se guarda junto.

## Verificación (dev, contra el Excel real)

- `npx tsc --noEmit` limpio. Sin errores de servidor.
- Nitro Red: registrar 1 venta → Venta Detal 1→2, stock previsualizado 2→1.
  Guardado. Tras **releer el Excel de cero**, mostró 1 → confirma que escribió en
  Venta Detal (no en Stock Disponible) y que la **fórmula recalculó**.
- Prueba revertida: Venta Detal 2→1, stock vuelve a 2. Nitro Red quedó intacto.

Pendiente: commit/push a develop para que quede en producción (esperando OK de Steven).
