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

---

## Ajuste (mismo día) — el plazo de un abono debe ser una quincena completa

Steven: Marcela abonó el **10 de septiembre** y aun así salía vencida.

**El defecto:** el plazo se calculaba con `siguienteCorte(fechaAbono)`, que
devuelve el corte *siguiente a esa fecha*. Abonar el 10 de septiembre daba plazo
solo hasta el 15 — cinco días. Peor: el plazo dependía del día en que cayera el
abono (abonar el 1 daba 14 días; abonar el 14, uno solo). Arbitrario.

**El fix:** `plazoPorAbono(fecha)` = fin de la quincena **siguiente a aquella en
que se abonó** (`siguienteCorte(finDeQuincena(fecha))`). Se cuenta desde el
cierre de la quincena del abono, no desde el día exacto, así siempre se da un
período completo.

| Abona | Antes | Ahora |
| --- | --- | --- |
| 1-sep | 15-sep (14 d) | 30-sep (29 d) |
| 10-sep | 15-sep (5 d) | 30-sep (20 d) |
| 14-sep | 15-sep (1 d) | 30-sep (16 d) |
| 16-sep | 30-sep (14 d) | 15-oct (29 d) |

Ahora el plazo siempre queda entre 15 y 29 días, nunca uno.

**Las ventas no se tocaron.** `fechaPagoSugerida` sigue contando los próximos N
cortes desde el día de la venta, y eso está bien: "2 quincenas" significa los dos
próximos pagos de nómina. Si se vende el 14, el cliente cobra el 15 y puede pagar
ahí. El abono es otra cosa — es un respiro, y un respiro de un día no es respiro.

### Verificación

- Probado el plazo para 10 días distintos del mes + febrero, 31 de enero y cambio
  de año (20-dic-2026 → 15-ene-2027).
- Marcela (venta 30-jul, abono 10-sep): pasa de "Venció hace 1 día" a **"Paga el
  30 de sept de 2026"**, sin rojo. Las dos Marcelas de la cartera quedaron bien.
- Si no vuelve a abonar, el 1-oct reaparece en rojo. Verificado.
- Control de que no se limpió de más: de 17 personas queda **1 vencida**, Juan
  José londoño — abonó el 21 de agosto, su quincena siguiente cerró el 15 de
  sept y no ha vuelto a pagar. Mora real, bien marcada.
