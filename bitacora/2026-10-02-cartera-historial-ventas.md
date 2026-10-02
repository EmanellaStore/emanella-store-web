# Bitácora — 2026-10-02 · Historial de ventas en la cartera

Steven: quiere una pestaña aparte con la lista de perfumes vendidos, en orden de
fecha: qué perfume, qué día, a qué hora, cuánto costó y a quién. Para tener
trazabilidad.

## Qué se hizo

- **Ruta** `/cartera/historial` (ya protegida por el `proxy.ts`, que cubre
  `/cartera/*`).
- **Barra superior**: nueva pestaña "Historial" junto a "Inventario"
  (`NavCartera`, componente cliente que marca en dorado la sección actual).
- **Datos** (`cartera.service.ts` → `getHistorialVendidos`): una fila por
  producto vendido, del más reciente al más viejo, con persona, tipo (fiado / de
  contado), cantidad y total (precio × cantidad). Las ventas **anuladas** se
  muestran tachadas y no suman, para no perder rastro; las eliminadas ya no
  existen en la base.
- **Pantalla** (`HistorialVendidos`):
  - Agrupado por día (hora Colombia), con el total de unidades y plata del día.
  - Columna de hora a la izquierda con la línea dorada vertical de la marca,
    como un registro de caja.
  - El nombre de la persona lleva a su ficha.
  - Buscador por perfume o persona y botones por mes (solo los meses con
    ventas). El resumen de arriba ("N perfumes vendidos · $X") refleja siempre
    lo filtrado.

## Decisiones

- **La hora es real.** El formulario de venta no manda fecha: la fecha de cada
  venta es el momento en que se registró. Se verificó en la base: las 46 ventas
  tienen `fecha` = `createdAt`. Si algún día se carga una venta con fecha
  atrasada (la API lo permite), se muestra "—" en vez de inventar una hora.
- **Las fechas se formatean en el servidor.** Al formatear la hora en el
  navegador, React marcaba error de hidratación: Node y Chromium escriben
  "p. m." con espacios invisibles distintos. El servicio entrega `hora`,
  `diaLargo`, `diaClave`, `mesClave` y `mesLargo` ya listos (hora Colombia) y
  el componente no formatea ninguna fecha.

## Verificación (dev, datos reales, vista de celular 375 px)

- `npx tsc --noEmit`: 0 errores en `src/`.
- Totales contra la base, calculados aparte sin usar el código de la app:
  - Todo: 68 perfumes · $11.345.000 = base de datos.
  - Agosto: 20 · $2.625.000 · 9 días = base de datos.
- Buscar "jefe": 5 perfumes · $750.000 en 2 días, con fiados y de contado.
- El Lattafa de Daza sale el **lunes 17 de agosto** (su día real en Colombia,
  no el 18 que habría dado UTC).
- Sin errores de hidratación tras el cambio a formateo en servidor; desaparece
  el aviso de Next.

---

## Ajuste — Cobrado / Por cobrar

Steven pidió desglosar el total del historial: lo vendido, lo que está por
cobrar y la diferencia (lo cobrado).

**Por qué por producto y no un total global.** El resumen ya reacciona a los
filtros (mes, búsqueda). Un "por cobrar" global debajo de un "vendido en agosto"
no cuadraría. Por eso cada producto vendido trae lo que falta por cobrar de él
(`pendiente`), y el resumen suma sobre lo que se esté viendo.

**Cómo se reparte lo pagado** (`pendientesPorItem` en `cartera.service.ts`):

1. El abono ligado a una venta (el automático de las de contado) paga esa venta.
2. El resto de los abonos de la persona paga sus compras más viejas primero.
3. Dentro de una venta, lo pagado cubre sus productos en orden.

**Pantalla:** debajo de "N perfumes vendidos · $X", una barra delgada con la
proporción cobrada y dos cifras: **Cobrado** y **Por cobrar**.

### Verificación (datos reales)

- 27 personas: lo pendiente de sus productos suma **exactamente** su saldo
  (0 descuadres). Ninguna venta de contado queda con pendiente; ningún
  pendiente negativo ni mayor que el precio.
- Sin filtro: vendido $11.345.000 · cobrado $7.055.000 · **por cobrar
  $4.290.000**, igual al "por cobrar" de la cartera.
- Por mes (oct / sep / ago / jul): vendido 150 + 4.820 + 2.625 + 3.750 =
  11.345; por cobrar 0 + 3.450 + 570 + 270 = 4.290; cobrado 150 + 1.370 +
  2.055 + 3.480 = 7.055 (miles). Los meses suman exacto al total.
- Vista de celular revisada; sin errores en consola.
