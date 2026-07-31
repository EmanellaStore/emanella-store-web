# Bitácora — 2026-07-31 · Sincronización con Shopify + ajustes de cartera (pre-despliegue)

Pedido de Steven antes de desplegar: (1) sincronizar Neon con Shopify
(borradores/activos/archivados; faltaban productos como Nitro Red), (2) achicar
el cuadro de abono en PC, (3) agregar botón de eliminar.

## 1. Sincronización con Shopify

Snapshot leído por MCP GraphQL (todos los estados; **no hay archivados**).
Script: `scripts/sincronizar-shopify.ts` (con `--dry-run`).

- **20 productos creados** en Neon que faltaban (todos borradores sin precio en
  Shopify → entran como inactivos, precio 0, género por tag): Nitro Red,
  Bharara King, Bharara Niche Femme, Club de Nuit Lion Heart Women, 9 PM Elixir,
  Ajwad, Cookie Crave (+ 3 combos), Fakhar Rose, Fame Couture, JP La Belle,
  Khamrah Dukhan, Pisa, y 4 Odyssey (Limoni/Mega/Spectra/Wild One).
- **Estado (isActive) sincronizado** con Shopify: 44 productos que estaban
  activos en Neon pero son borrador en Shopify pasaron a **borrador**.
- Slug corregido: `moshino-toy-2-black-` → `moshino-toy-2-black`.
- **No se tocaron precios ni stock** de los productos existentes: se preservó la
  gestión de inventario de Neon y se evitó importar rarezas de Shopify (p. ej.
  Mallow Madness figura a $1.000 en Shopify, claramente un error de allá).

Resultado: **121 productos (50 activos / 71 borradores)**. El catálogo público
pasó de ~94 a **50 productos activos** — reflejo fiel de lo publicado en Shopify.
Los borradores quedan guardados (visibles en la cartera y activables desde el
admin cuando se les ponga precio).

⚠️ Cambio grande a la vista: la tienda ahora muestra 50 productos en vez de ~94.
Es lo correcto (mirror de Shopify). Para mostrar más, activarlos en el admin.

Bonus: el **Bharara King** de Geral ya existe en el catálogo; se puede enlazar su
ítem de cartera cuando se quiera (hoy sigue como texto).

## 2. Cuadro de abono más pequeño en PC

`AccionesCliente.tsx`: el modal era una hoja a todo el ancho. Ahora en escritorio
(`sm:`) es una tarjeta centrada `max-w-sm` con borde y sombra; en el celular sigue
como hoja inferior a lo ancho.

## 3. Botones de eliminar

- **Por movimiento**: cada fiado y cada abono en la ficha tiene un ícono de
  papelera (`BotonEliminarMovimiento.tsx`) con confirmación en línea ("Eliminar /
  No"). Borra de verdad (por si se registró por error).
- **Por persona**: al final de la ficha, "Eliminar esta persona"
  (`EliminarPersona.tsx`) con doble confirmación; borra a la persona y todo su
  historial (cascada) y vuelve a la lista.
- Servicio: `eliminarVenta` y `eliminarCliente` nuevos.
- APIs: `DELETE /api/cartera/ventas` y `DELETE /api/cartera/clientes` nuevos
  (el de abonos ya existía).

## Verificación (preview)

- Sync: Nitro Red y Bharara King aparecen en el buscador de la cartera (borrador);
  catálogo público = 50 productos.
- Cartera real intacta: **$2.405.000, 11 personas**.
- Ciclo completo de borrado probado por API con persona desechable: abono → venta
  → persona, todo eliminado y confirmado (quedan 0). Datos reales no tocados.
- `npx tsc --noEmit` limpio. Sin errores de consola.

Sin commits (regla 1). Listo para el despliegue en Vercel (`.vercel.app`).
