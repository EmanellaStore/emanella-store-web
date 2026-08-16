# Conectar el inventario con el Excel (Google Apps Script)

El módulo `/inventario` lee y escribe el Excel directamente. Como la organización
bloquea las llaves de service account (política `iam.disableServiceAccountKeyCreation`),
en vez de Google Cloud usamos un **Google Apps Script** pegado dentro del mismo
Excel. No requiere consola de Cloud, ni llaves, ni permisos de organización: el
script corre con tu propia cuenta (que ya tiene acceso a la hoja) y se protege con
un secreto compartido. Toma ~5 minutos.

Excel: https://docs.google.com/spreadsheets/d/1LzUWaZoafRbjcdZpVnMa1_olL9VrPpa5IGaD0plL48Y

## Paso 1 — Pegar el script en el Excel

1. Abre el Excel del inventario.
2. Menú **Extensiones → Apps Script**. Se abre el editor de scripts.
3. Borra lo que haya y **pega todo el contenido** de
   `scripts/inventario-apps-script.gs` (está en el repo).
4. En la línea `var SECRETO = "..."`, reemplaza el texto por un secreto largo. Puedes
   usar este que ya generé:

   ```
   b0f70bfFm-1lhtYw_ne_upyr_8lYaMDs
   ```

   (o cualquier cadena larga que quieras; guárdala, la necesitas en el Paso 3).
5. Guarda (ícono de disquete o Ctrl+S).

## Paso 2 — Desplegar como Web App

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje ⚙ (tipo), elige **Aplicación web**.
3. Configura:
   - **Descripción:** inventario (lo que quieras).
   - **Ejecutar como:** *Yo (tu correo)*.
   - **Quién tiene acceso:** **Cualquier usuario**.
     (No es un hueco de seguridad: sin el secreto correcto el script rechaza todo.)
4. **Implementar**. La primera vez Google pide autorizar permisos → acepta
   (aparece "Google no verificó la app" → **Configuración avanzada → Ir a … (no
   seguro)** → Permitir. Es tu propio script sobre tu propia hoja).
5. Copia la **URL de la aplicación web** (termina en `/exec`). Se ve así:
   `https://script.google.com/macros/s/AKfycb.../exec`

## Paso 3 — Variables en Vercel

En el proyecto en Vercel → **Settings → Environment Variables**, agrega (para
Production, Preview y Development):

| Variable | Valor |
| --- | --- |
| `INVENTARIO_SCRIPT_URL` | la URL `/exec` que copiaste |
| `INVENTARIO_SCRIPT_SECRET` | el mismo secreto que pusiste en el script |

Luego **Redeploy** para que tome las variables.

## Paso 4 — Probar

1. Entra a `tu-dominio.vercel.app/inventario` con el login de la cartera.
2. Debe aparecer la lista con todos los productos y su stock/precios.
3. Cambia un stock o un precio → **Guardar en el Excel** → revisa que el Excel se
   actualizó.

## Para probar en local (opcional)

Pon las mismas variables en `.env` (o `.env.local`) y corre `npm run dev`:

```
INVENTARIO_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
INVENTARIO_SCRIPT_SECRET=b0f70bfFm-1lhtYw_ne_upyr_8lYaMDs
```

## Actualizar el script (para "Agregar producto")

La función de **agregar un producto nuevo** desde la app necesita una versión más
nueva del script (acción `append`). Para activarla:

1. Abre el Excel → **Extensiones → Apps Script**.
2. Reemplaza todo con el contenido actualizado de
   `scripts/inventario-apps-script.gs` (recuerda volver a poner tu `SECRETO`).
3. **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva →
   Implementar.** Así la **misma URL** queda con el código nuevo (no hay que tocar
   Vercel).

El script agrega la fila al final de la tabla y **copia las fórmulas de la fila de
arriba** (Stock Disponible, Inversión, Ganancias, Utilidad), así el producto nuevo
se comporta igual que los demás.

## Si cambias el script después

Cada vez que edites el `.gs`, debes **Implementar → Gestionar implementaciones →
editar (lápiz) → Versión: Nueva → Implementar** para que los cambios entren en la
misma URL. Si creas una implementación nueva desde cero, cambia la URL y hay que
actualizar `INVENTARIO_SCRIPT_URL` en Vercel.

## Notas

- La app **solo escribe** en las columnas Stock Disponible, Precio Compra, Precio
  Mayorista, Precio Detal y Estado. Nunca toca las columnas de fórmula (Inversión,
  Ganancias, Utilidad).
- La tabla se detecta por sus encabezados: puedes mover filas o agregar productos
  en el Excel sin romper nada (mientras no cambies los nombres de las columnas).
- Seguridad: la URL es pública pero inútil sin el secreto. Si alguna vez se filtra,
  cambia el secreto en el script y en Vercel.
