# Bitácora — 2026-09-16 · Cálculo de vencimiento y plazos de 1 a 6 quincenas

Steven reportó dos bugs y pidió ampliar los plazos:

1. Alguien vencido que **abona** seguía en rojo.
2. Alguien vencido al que se le hace una **venta nueva** seguía en rojo, en vez de
   extenderse el plazo.
3. Ampliar los plazos a 2-3-4-5-6 quincenas y revisar el cálculo.

## La raíz

Una sola línea: `proximoVencimiento` tomaba la fecha de pago **más antigua**
(`orderBy: { fechaPago: "asc" }` y se quedaba con la primera). Esa fecha nunca se
movía, así que ni un abono ni una venta nueva podían sacar a nadie del rojo. La
ficha de la persona repetía el mismo cálculo por su cuenta, con un `.sort()`
ascendente.

## La regla nueva (confirmada con Steven)

**Manda el compromiso más reciente**, no el más viejo. Dos cosas corren el plazo:

- **Venta nueva a crédito** → la fecha pactada más reciente manda.
- **Abono** → da plazo hasta el **siguiente corte de quincena**. Premia a quien
  está abonando sin perder de vista a quien se queda callado: si no vuelve a
  abonar, al pasar ese corte reaparece en rojo.

Se descartó "cualquier abono quita el rojo hasta que termine de pagar" porque
alguien podía abonar $5.000 de una deuda de $300.000 y no volver a salir nunca.

## Qué se hizo

- `lib/cartera.ts`: nueva `fechaLimiteCuenta(fechasPago, ultimoAbono)`. **Vive en
  un solo lugar** a propósito: antes la lista y la ficha calculaban lo mismo por
  separado y podían discrepar. `siguienteCorte` se exportó y ahora devuelve las
  fechas **al mediodía** — a medianoche, guardadas en un servidor en UTC, se leen
  en Colombia (−5) como el día anterior.
- `cartera.service.ts`: `orderBy` pasa a `desc` y se trae además el último abono
  por cliente (`_max: { fecha: true }`).
- `cartera/[id]/page.tsx`: usa la misma función compartida.
- `NuevaVentaForm`: los chips pasan de 3 opciones sueltas (2/3/1) a **1-6
  quincenas**, y debajo se muestra en vivo la fecha resultante ("vence el 15 de
  oct de 2026"), que antes había que adivinar.

## Verificación

- `npx tsc --noEmit`: 0 errores en `src/`.
- Cálculo de cortes probado desde 10 fechas distintas × 6 plazos: alterna 15 /
  último día, y resuelve bien febrero (28), el 31 de enero y el cambio de año
  (31-dic-2026 → 15-ene-2027).
- Caso Pepito reproducido en la app con una persona de prueba (producto inventado
  para no tocar el Excel — `descontados: 0`):
  - Venta fiada vencida el 31-ago → "Venció hace 16 días", en rojo. ✓
  - Abona $50.000 → "Paga el 30 de sept de 2026", **sin rojo**, saldo $150.000. ✓
  - Se le quita el abono → vuelve a rojo. ✓ (no se queda "perdonado")
  - Venta nueva con fecha 15-oct → "Paga el 15 de oct de 2026", sin rojo. ✓
  - Verificado en la lista y en la ficha.
- Formulario: chips 1-6; 2 quincenas → 15-oct, 6 quincenas → 15-dic (coincide con
  la tabla del cálculo).
- Persona de prueba eliminada; no queda rastro.

## Nota de entorno

`/api/auth/*` empezó a devolver 404 con los archivos intactos: caché de Turbopack
corrupta en `.next`. Se resolvió borrando `.next`. No tiene que ver con el cambio.
