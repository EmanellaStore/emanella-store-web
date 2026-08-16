/**
 * Inventario Emanella — Web App de Google Apps Script.
 *
 * Se pega dentro del MISMO Excel del inventario (Extensiones → Apps Script).
 * La app Next.js le habla por su URL (/exec) y este script lee/escribe la
 * primera hoja. No usa service accounts ni Google Cloud: corre con la cuenta
 * dueña de la hoja. Se protege con un secreto compartido.
 *
 * Acciones: read (leer tabla), write (escribir celdas), append (agregar producto
 * nuevo copiando las fórmulas de la fila de arriba).
 *
 * Pasos y re-despliegue: ver docs/07-inventario-conexion-google.md
 *
 * IMPORTANTE: cambia SECRETO por el mismo valor que pongas en la variable
 * INVENTARIO_SCRIPT_SECRET de Vercel.
 */

var SECRETO = "PEGA_AQUI_EL_MISMO_SECRETO_DE_VERCEL";

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRETO) {
      return json({ ok: false, error: "unauthorized" });
    }

    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (body.action === "read") {
      var valores = hoja.getDataRange().getValues();
      return json({ ok: true, titulo: hoja.getName(), valores: valores });
    }

    if (body.action === "write") {
      var updates = body.updates || [];
      for (var i = 0; i < updates.length; i++) {
        hoja.getRange(updates[i].range).setValue(updates[i].value);
      }
      return json({ ok: true, escritas: updates.length });
    }

    if (body.action === "append") {
      return json(agregarProducto(hoja, body.valores || {}));
    }

    return json({ ok: false, error: "accion desconocida" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/**
 * Agrega un producto nuevo: inserta una fila al final de la tabla principal,
 * copia las fórmulas y el formato de la fila de arriba (Stock Disponible,
 * Inversión, Ganancias, Utilidad…) y llena solo los campos recibidos.
 */
function agregarProducto(hoja, valores) {
  var lastCol = hoja.getLastColumn();
  var matriz = hoja.getDataRange().getValues();

  // Encuentra la fila de encabezados de la tabla principal.
  var headerRow = -1;
  var col = null;
  for (var i = 0; i < matriz.length; i++) {
    var mapa = mapearColumnas(matriz[i]);
    if (mapa) { headerRow = i; col = mapa; break; }
  }
  if (headerRow < 0) return { ok: false, error: "no se encontro la tabla" };

  // Última fila de producto (nombre no vacío) antes del primer vacío.
  var ultima = headerRow; // índice 0-based
  for (var r = headerRow + 1; r < matriz.length; r++) {
    var nombre = String(matriz[r][col.nombre] || "").trim();
    if (!nombre) break;
    ultima = r;
  }
  var filaPlantilla = ultima + 1; // fila real (1-based) del último producto

  // Inserta la fila nueva y copia la plantilla (fórmulas + formato + valores).
  hoja.insertRowAfter(filaPlantilla);
  var nueva = filaPlantilla + 1;
  hoja
    .getRange(filaPlantilla, 1, 1, lastCol)
    .copyTo(hoja.getRange(nueva, 1, 1, lastCol));

  // Limpia las columnas de ENTRADA (las que NO son fórmula en la plantilla).
  var formulas = hoja.getRange(filaPlantilla, 1, 1, lastCol).getFormulas()[0];
  for (var c = 0; c < lastCol; c++) {
    if (!formulas[c]) hoja.getRange(nueva, c + 1).setValue("");
  }

  // Llena los campos recibidos.
  function poner(campo, val) {
    if (col[campo] != null && val != null && val !== "") {
      hoja.getRange(nueva, col[campo] + 1).setValue(val);
    }
  }
  poner("nombre", valores.nombre);
  poner("tipo", valores.tipo);
  poner("stockInicial", valores.stockInicial);
  poner("precioCompra", valores.precioCompra);
  poner("precioMayorista", valores.precioMayorista);
  poner("precioDetal", valores.precioDetal);
  poner("estado", valores.estado);
  // Producto nuevo: sin ventas todavía.
  if (col.ventaDetal != null) hoja.getRange(nueva, col.ventaDetal + 1).setValue(0);

  return { ok: true, fila: nueva };
}

/** Mapa canónico → índice de columna (0-based). null si la fila no es el encabezado. */
function mapearColumnas(fila) {
  var col = {};
  for (var i = 0; i < fila.length; i++) {
    var h = norm(fila[i]);
    if (h === "nombre del articulo") col.nombre = i;
    else if (h === "tipo") col.tipo = i;
    else if (h === "stock inicial") col.stockInicial = i;
    else if (h === "venta detal") col.ventaDetal = i;
    else if (h === "precio compra") col.precioCompra = i;
    else if (h === "precio mayorista") col.precioMayorista = i;
    else if (h === "precio detal" || h === "precio deltal") col.precioDetal = i;
    else if (h === "estado") col.estado = i;
  }
  if (col.nombre == null || col.estado == null) return null;
  return col;
}

/** minúsculas, sin tildes, sin dobles espacios. */
function norm(s) {
  return String(s == null ? "" : s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
