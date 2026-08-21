# Bitácora — 2026-08-21 · Las devoluciones vuelven al stock

Steven: vendió 2 perfumes a una persona, el cliente se retractó y devolvió uno.
Al quitarlo de la cartera el Excel no sumó la unidad de vuelta. Pedido: que
retractar una venta sea el inverso exacto de registrarla, y que si el producto
estaba agotado vuelva a quedar "En stock".

## Qué se hizo

### Un solo camino para las dos direcciones

`descontarPorVenta` y la nueva `devolverAlInventario` ahora son dos envoltorios
de `ajustarVentaDetal(lineas, signo)` (+1 vende, −1 devuelve). Se unificó a
propósito: si la venta y la devolución fueran dos implementaciones separadas,
podrían desalinearse con el tiempo.

- El estado sigue al stock **en las dos direcciones**: cae a 0 → "Se debe volver
  a comprar"; vuelve a tener unidades → "En stock". Solo escribe si cambia.
- **Nunca toca "Temporalmente no disponible"** — ese lo pone Steven a propósito.
- Venta Detal se topa en 0: si se devuelve más de lo registrado, no queda
  negativo (rompería la fórmula del stock).
- El resultado ahora trae `repuestos: number[]` además de `agotados`.

### Dónde se dispara la devolución

- `DELETE /api/cartera/ventas` (eliminar una venta) → repone sus ítems.
- `PATCH /api/cartera/ventas` (anular) → repone sus ítems.
- **Nuevo** `DELETE /api/cartera/ventas/items` → quita **un solo producto** de la
  venta (el caso real), recalcula el total y repone esa línea. Si era el único
  producto, elimina la venta completa.

Cuidado con el doble conteo: si la venta ya estaba **anulada**, el stock ya se
repuso en ese momento, así que borrarla después no vuelve a sumar.

### UI

`BotonDevolverProducto`: iconito de deshacer (↩) al lado del precio de cada
producto, con confirmación en dos toques igual que el resto de la cartera.

## Verificación (dev, datos reales)

- `npx tsc --noEmit`: 0 errores en `src/`.
- Reproducido el caso exacto: venta fiada de "Asad Zanzibar" (fila 24, stock 1 →
  se agota) + "Yara Moi" (fila 117). Respuesta `{descontados: 2, agotados: [24]}`,
  total $310.000.
- Devuelto **solo** el Asad Zanzibar → `{repuestos: [24]}`; en el Excel volvió a
  `stock: 1, "En stock"`, Yara Moi siguió vendida, y el saldo de la persona bajó
  solo a $150.000.
- Devuelto el último producto por la UI → la venta entera desapareció, saldo $0,
  y Yara Moi volvió a `stock: 2, ventaDetal: 0`.
- Todo revertido: las dos filas quedaron en su estado base exacto y la persona de
  prueba se eliminó.

## Pendiente por decidir

**Eliminar una persona** (`DELETE /api/cartera/clientes`) borra sus ventas en
cascada **sin** reponer el stock. Es la misma clase de caso, pero no es obvio que
deba reponer: borrar a alguien suele ser limpiar un registro viejo ya pagado, y
reponer ahí inflaría el inventario con mercancía que sí salió. Queda como está
hasta que Steven decida.
