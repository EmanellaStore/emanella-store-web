# Bitácora — 2026-10-02 · El resumen del deudor muestra solo lo vigente

Steven: en la ficha de Daza Celacho decía "Debe $420.000" (correcto) pero "Fiado
$570.000 · Abonado $150.000": sumaba una venta anterior que ya estaba pagada por
completo. Quiere ver solo lo actual.

## Qué se hizo

- `lib/cartera.ts` → `cicloActual(ventas, abonos)`: ordena ventas y abonos en el
  tiempo y corta en **la última vez que la persona quedó en $0**. Lo de ahí en
  adelante es el ciclo vigente.
  - `fiado` = ventas a crédito del ciclo (las de contado se pagan solas).
  - `abonado` = fiado − saldo, derivado a propósito: así `fiado − abonado`
    siempre cuadra con "Debe", aunque haya quedado algún saldo a favor de antes.
  - Mismo día: primero la venta y luego el abono (así una venta de contado y su
    abono automático se cancelan y no abren un ciclo falso).
- `cartera/[id]/page.tsx`:
  - Resumen: "Fiado $X · Abonado $Y" con el ciclo vigente; si no ha abonado nada
    en el ciclo, se omite "Abonado $0".
  - **Estado de cuenta de WhatsApp / Copiar**: tenía el mismo error — le listaba
    al cliente productos ya pagados y "Abonos" de todo el historial. Ahora solo
    lista las ventas del ciclo y los abonos del ciclo.
- El historial de **movimientos no cambia**: sigue mostrando todo.

## Verificación (dev, datos reales)

- `npx tsc --noEmit`: 0 errores en `src/`.
- Daza Celacho: de "Fiado $570.000 · Abonado $150.000" a **"Fiado $420.000"**.
  El estado de cuenta ya no incluye el Lattafa Shaheen Silver pagado ni la línea
  de abonos; termina en "Saldo pendiente: $420.000".
- Las 20 personas de la cartera revisadas: **0 descuadres** (fiado − abonado =
  debe en todas). 14 tienen abonos dentro de su ciclo vigente.

## Fechas en hora Colombia (corregido en la misma sesión)

**El bug.** Vercel corre en UTC (5 h adelante). Todo lo que se registraba después
de las 7 p. m. hora Colombia se mostraba con fecha del día siguiente, y "hoy"
cambiaba a las 7 p. m.: quien vencía ese día pasaba a rojo en la noche y no a la
medianoche. Evidencia (Daza): "Yum Yum Armaf" registrado el 28-sep 7:35 p. m.
(`2026-09-29T00:35Z`) salía en producción como "29 de sept". En local no se veía
porque el PC está en hora Colombia.

**El fix** (`lib/cartera.ts`): todo el cálculo de días se hace sobre el
calendario de Colombia, sin importar dónde corra el código. Colombia es UTC−5
fijo, sin horario de verano, así que basta un desfase constante.

- `partesCO`, `mediodiaCO`, `diaCO`: año/mes/día y comparación de días en hora
  Colombia. Las fechas de un día (pago pactado, cortes) se guardan al mediodía de
  Colombia (17:00 UTC).
- `siguienteCorte`, `finDeQuincena`, `parseFechaLocal`: sobre esos helpers.
- `formatFecha`: `timeZone: "America/Bogota"`.
- `estaVencida` / `diasDeAtraso`: comparan días de Colombia. El servicio de la
  lista dejó de calcular su propio "hoy" y usa `estaVencida`.
- `aInputDate` pasó a `lib/cartera` (el formulario tenía una copia con la hora
  local del navegador).

**Verificación.**
- La misma batería corrida con el reloj en `TZ=UTC` (Vercel) y en
  `TZ=America/Bogota`: **resultado idéntico**. Se confirmó que Windows sí aplicó
  UTC (offset 0; ahí un `Date` normal da 29 para el registro de Yum Yum, las
  funciones nuevas dan 28). Casos: registros nocturnos de Daza, abono a las
  8 p. m. del 15-sep (cuenta como 15 → plazo 30-sep), corte desde el 30-sep a
  las 9 p. m. (→ 15-oct), vencimiento el mismo día a las 8 p. m. (todavía no) y
  a las 12:30 a. m. del día siguiente (sí), febrero y cambio de año.
- Base de datos: las 44 fechas pactadas están guardadas a las 05, 12 o 17 UTC,
  ninguna cambia de día con la lectura nueva. 32 de 94 registros (ventas y
  abonos) se hicieron de noche: esos se veían con un día de más en producción y
  quedan corregidos sin tocar la base.
- Pantallas (lista, ficha, nueva venta) cargan bien. Daza: Yum Yum "28 de sept",
  abono "22 de sept". 5 vencidos al 2-oct, todos con plazo cumplido el 30-sep y
  sin abonos desde la primera quincena de septiembre (incluida Marcela, que
  volvió a rojo el 1-oct, como se previó).
