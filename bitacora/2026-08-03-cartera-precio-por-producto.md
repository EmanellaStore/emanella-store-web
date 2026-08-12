# Bitácora — 2026-08-03 · Cartera: precio por producto en el resumen

Steven pidió que en la cartera se vea el precio de cada producto en el resumen.
Ejemplo: "Pepito compró Phantom en 160 y Nitro Red en 180" → que se vea el precio
de cada uno.

## Hallazgo

El precio **ya se captura y se guarda** por producto: el formulario de nueva venta
tiene un `InputMonto` por ítem (prellenado con el precio del catálogo, editable) y
`CarteraVentaItem.precio` lo almacena. `getFichaCliente` ya incluye los ítems con
su precio. O sea: no hubo que tocar base de datos, ni el formulario, ni el servicio.
Solo faltaba **mostrarlo**.

## Cambios (solo display, en `src/app/cartera/[id]/page.tsx`)

1. **Movimientos (ficha):** cada venta ahora despliega sus ítems como lista, con el
   precio de cada uno a la derecha (antes iban en una línea de solo nombres).
   Muestra `precio × cantidad` por ítem (para cantidad > 1: "2x Nombre — $…").
2. **Estado de cuenta (WhatsApp/copiar):** cada ítem ahora sale con su precio:
   `• 30 jul — Xerjoff Erba Pura: $350.000, Bharara King: $180.000`.

## Verificación (dev, datos reales)

- `npx tsc --noEmit`: 0 errores en `src/` (los de `.next/dev/types/validator.ts`
  son artefactos generados que Next regenera en el build).
- Ficha de Geral: el fiado de $530.000 muestra Xerjoff Erba Pura $350.000 y
  Bharara King $180.000. El texto copiado incluye ambos precios. Sin errores.

Pendiente: commit/push a develop (esperando OK de Steven).
