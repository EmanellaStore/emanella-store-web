# 05 · Spec — Cartera (fiados y abonos)

> Sistema aparte de la tienda para llevar lo que hoy se anota en WhatsApp:
> a quién se le vendió, qué se le entregó, cuánto debe y qué ha abonado.
> Uso principal: **celular**, por Steven y su esposa.

---

## 1. El problema (tal cual hoy)

Las notas actuales en WhatsApp:

```
Empleada (Yuliana) Luis: Yara Elixir 200–130. SALDO: 70
Sherin: postre mallow madness + mantequilla 170
Marcela 150 Jean paul elixir / 90 360women / 220 club nuit / 150 phantom → TOTAL: 610
Jessica mocha: abona 150, saldo 100
```

De ahí salen los requisitos reales:

| Lo que se ve en la nota | Lo que el sistema necesita |
|---|---|
| "Luis", "Sherin", "Empleada de Luis" | **Cliente** (persona; el apodo es parte del nombre) |
| "Yara Elixir 200" | **Ítem del catálogo** con precio editable |
| "150 Jean paul + 90 360women + …" | Una venta con **varios ítems** |
| "TOTAL: 610" | Total calculado, no digitado |
| "200–130. SALDO: 70" | **Abonos** parciales y saldo automático |
| "abona 150" | Los montos se escriben **en miles** |
| "a dos quincenas" | **Fecha de pago** sugerida (ajustable) + alerta de vencidos |

**Todo sale del catálogo** (aclaración de Steven 2026-07-09): los nombres cortos
de las notas son apodos para identificar rápido — "postre mallow madness" es
*Lattafa Mallow Madness* y "mantequilla" es *Mantequillas Corporales Victoria
Secret's*. Por eso los ítems se **buscan en el catálogo** (búsqueda tolerante,
por palabra suelta) y traen su precio, pero **el precio es editable**: al fiar se
suele cobrar distinto al precio web.

También se registran **ventas de contado** a conocidos, no solo fiados.

## 2. Arquitectura

Dentro del mismo proyecto Next.js, pero **completamente aislado**:

- Rutas propias `/cartera/*` (no comparten nada con la tienda ni con `/admin`).
- Tablas nuevas con prefijo `cartera_` en la **misma base Neon** (no se modifica
  ninguna tabla existente; solo se agregan).
- **PWA instalable**: se agrega al inicio del celular con su ícono y nombre
  ("Cartera Emanella") y abre a pantalla completa, como app aparte.

## 3. Modelo de datos (tablas nuevas)

```prisma
model CarteraCliente {            // cartera_clientes
  id, nombre, telefono?, notas?, activo, createdAt
}

model CarteraVenta {              // cartera_ventas
  id, clienteId, tipo (CREDITO | CONTADO), fecha,
  fechaPago?,        // solo crédito: vencimiento sugerido
  total,             // suma de los ítems
  notas?, anulada, createdBy?
}

model CarteraVentaItem {          // cartera_venta_items
  id, ventaId,
  productId?, variantId?,   // enlace al catálogo (opcional por si se borra)
  descripcion,              // snapshot del nombre: el historial no cambia después
  cantidad, precio          // precio unitario, editable al vender
}

model CarteraAbono {              // cartera_abonos
  id, clienteId, ventaId?, fecha, monto, metodo?, nota?, createdBy?
}
```

- **Saldo del cliente** = Σ ventas a crédito no anuladas − Σ abonos.
- Las ventas **de contado** nacen con un abono automático por el total, así el
  saldo queda en cero y el historial queda completo.
- Los abonos son **cuenta corriente** (a la persona). Se aplican FIFO a las
  ventas más antiguas solo para mostrar cuáles quedaron saldadas.
- Sin llaves foráneas duras al catálogo: si un producto se elimina, la venta
  conserva su descripción y su precio.

## 4. Pantallas (móvil primero)

1. **Inicio `/cartera`** — total en cartera, cuántos deben, cuántos vencidos;
   lista de personas con saldo; buscador; botón grande **"+ Nueva venta"**.
2. **Nueva venta `/cartera/nuevo`** — cliente (buscar o crear al vuelo),
   tipo (**Fiado** / **Contado**), ítems buscando en el catálogo con precio
   editable, total automático, fecha de pago con atajos.
3. **Ficha `/cartera/[id]`** — saldo grande, línea de tiempo de ventas y abonos,
   botones **"+ Abono"**, **"Recordar por WhatsApp"**, **"Estado de cuenta"**.

## 5. Reglas de negocio

- **Montos en miles:** escribir `150` guarda `$150.000` (regla: valores menores a
  1.000 se multiplican por mil). Debajo del campo se muestra "= $150.000" en vivo.
- **Fecha de pago:** por defecto **dos quincenas** (cortes 15 y 30), con atajos
  para "1 mes" o fecha personalizada. Siempre editable.
- **Vencido:** saldo > 0 y fecha de pago pasada → se marca en rojo.
- **Saldado:** al llegar a 0 sale de la lista principal, queda el historial.
- **Nada se elimina:** las ventas se *anulan*, dejando rastro.
- **No toca el inventario** de la tienda (decisión de Steven).

## 6. Acceso

- Rol nuevo `CARTERA` en la tabla de usuarios existente.
- `/cartera/*` y `/api/cartera/*` abiertos solo a `ADMIN` y `CARTERA`.
- **Un solo usuario compartido** para Steven y su esposa, distinto al de la
  tienda; con rol `CARTERA` no ve el admin de la tienda.
- Cada movimiento guarda qué usuario lo registró.

## 7. Fases

| Fase | Qué se hace | Estado |
|---|---|---|
| **C1** | Schema + `prisma db push` (solo tablas nuevas) | ✅ 2026-07-30 |
| **C2** | Rol `CARTERA`, protección de rutas, usuario compartido, PWA | ✅ 2026-07-30 |
| **C3** | Pantallas núcleo: inicio, nueva venta, ficha, abono | ✅ 2026-07-30 |
| **C4** | Extras: recordatorio WhatsApp, vencidos, estado de cuenta | ✅ 2026-07-30 |
| **C5** | Carga de la cartera actual (lista de WhatsApp de Steven) | ✅ 2026-07-30 — 14 personas, $2.905.000 |
| **C6** | Pruebas en celular real + despliegue | ⏳ pendiente |

### Pendientes de la carga inicial (C5)

- **Abono grupal de $500.000** (Sherin / Luis / Leidy): no se aplicó porque la
  nota no dice cuánto puso cada uno. Sus deudas están completas (170 / 170 / 250).
- Sin fechas de pago: la lista de WhatsApp no las traía.
- Suposiciones marcadas en las notas de cada venta: reparto 150/150 de la venta
  de contado de Jefe Anderson, y "club nuit lion hearth men" enlazado a
  *Club de Nuit Intense Armaf Man*.
- Faltan en el catálogo: **Bharara King** y la "Yara tradicional".

## 8. Decisiones tomadas (2026-07-09)

1. Mismo proyecto, rutas `/cartera`. ✔
2. **Sin responsables** — "Empleada de Luis" es simplemente el nombre. ✔
3. Abonos en **cuenta corriente** por persona. ✔
4. Atajo de miles. ✔
5. Fecha de pago sugerida a dos quincenas, **ajustable a más**. ✔
6. **No** descontar inventario. ✔
7. Un solo usuario compartido, aparte del de la tienda. ✔
8. Se registran **fiados y contado**. ✔
