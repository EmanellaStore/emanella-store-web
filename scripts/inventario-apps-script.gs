/**
 * Inventario Emanella — Web App de Google Apps Script.
 *
 * Se pega dentro del MISMO Excel del inventario (Extensiones → Apps Script).
 * La app Next.js le habla por su URL (/exec) y este script lee/escribe la
 * primera hoja. No usa service accounts ni Google Cloud: corre con la cuenta
 * dueña de la hoja. Se protege con un secreto compartido.
 *
 * Acciones: read (leer tabla), write (escribir celdas), append (agregar producto
 * nuevo copiando las fórmulas de la fila de arriba), estado (escribir estado y
 * pintar Estado + Stock Disponible) y colores (diagnóstico, solo lectura).
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

    if (body.action === "estado") {
      return json(marcarEstados(hoja, body.updates || []));
    }

    if (body.action === "colores") {
      return json(leerColores(hoja));
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

/**
 * Ubica la tabla principal: fila de encabezados, columnas y la última fila de
 * producto. Devuelve null si no la encuentra.
 */
function ubicarTabla(hoja) {
  var matriz = hoja.getDataRange().getValues();
  for (var i = 0; i < matriz.length; i++) {
    var col = mapearColumnas(matriz[i]);
    if (!col) continue;
    var ultima = i; // índice 0-based del último producto
    for (var r = i + 1; r < matriz.length; r++) {
      if (!String(matriz[r][col.nombre] || "").trim()) break;
      ultima = r;
    }
    return { matriz: matriz, col: col, header: i, primera: i + 2, ultima: ultima + 1 };
  }
  return null;
}

/** El valor que más se repite (null si la lista está vacía). */
function moda(valores) {
  var cuenta = {};
  var mejor = null;
  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    cuenta[v] = (cuenta[v] || 0) + 1;
    if (mejor === null || cuenta[v] > cuenta[mejor]) mejor = v;
  }
  return mejor;
}

/**
 * Escribe el Estado de una o varias filas y pinta las casillas de **Estado y
 * Stock Disponible** igual que las demás filas en la misma situación.
 *
 * El color no está escrito en el código: se toma el que MÁS se repite en el
 * Excel (ver refStock / refEstado abajo). Una fila mal pintada no arrastra a las
 * demás porque manda la mayoría. Sin referencias, solo se escribe el texto.
 */
function marcarEstados(hoja, updates) {
  var t = ubicarTabla(hoja);
  if (!t) return { ok: false, error: "no se encontro la tabla" };
  var col = t.col;
  var n = t.ultima - t.primera + 1;
  if (n <= 0) return { ok: true, escritas: 0, pintadas: 0 };

  var rEstado = hoja.getRange(t.primera, col.estado + 1, n, 1);
  var fondoEstado = rEstado.getBackgrounds();
  var letraEstado = rEstado.getFontColors();
  var rStock = col.stock != null ? hoja.getRange(t.primera, col.stock + 1, n, 1) : null;
  var fondoStock = rStock ? rStock.getBackgrounds() : null;
  var letraStock = rStock ? rStock.getFontColors() : null;

  // Solo se excluyen de la referencia las filas que CAMBIAN de estado (su color
  // actual es el del estado viejo). Las que ya tienen ese estado y solo se
  // repintan siguen contando: si no, al repintar todas las agotadas no quedaría
  // ninguna de referencia.
  var objetivo = {};
  for (var u = 0; u < updates.length; u++) {
    var fu = Number(updates[u].fila);
    if (fu >= t.primera && fu <= t.ultima &&
        norm(t.matriz[fu - 1][col.estado]) !== norm(updates[u].estado)) {
      objetivo[fu] = true;
    }
  }

  var tocadas = {};
  for (var w = 0; w < updates.length; w++) tocadas[Number(updates[w].fila)] = true;

  function stockDe(fila) {
    if (col.stock == null) return null;
    var v = Number(String(t.matriz[fila - 1][col.stock]).replace(/[^0-9.-]/g, ""));
    return isNaN(v) ? null : v;
  }

  // Colores de referencia, calculados una sola vez:
  // - Casilla de STOCK DISPONIBLE: depende del stock, no del estado. En el Excel
  //   real (2026-10-02) las filas con unidades están en verde y las que están en
  //   0 en naranja, sea cual sea su estado. Se toma el más repetido entre TODAS
  //   las filas en la misma condición (en 0 / con unidades), sin las que se están
  //   tocando.
  // - Casilla de ESTADO: el más repetido entre las filas con ese mismo estado.
  var cacheStock = {}, cacheEstado = {};
  function refStock(enCero) {
    if (cacheStock[enCero] !== undefined) return cacheStock[enCero];
    var f = [], l = [];
    for (var i = 0; i < n && fondoStock; i++) {
      var fila = t.primera + i;
      if (tocadas[fila]) continue;
      var s = stockDe(fila);
      if (s === null || (s <= 0) !== enCero) continue;
      f.push(fondoStock[i][0]); l.push(letraStock[i][0]);
    }
    cacheStock[enCero] = f.length ? { fondo: moda(f), letra: moda(l) } : null;
    return cacheStock[enCero];
  }
  function refEstado(estado) {
    var clave = norm(estado);
    if (cacheEstado[clave] !== undefined) return cacheEstado[clave];
    var f = [], l = [];
    for (var i = 0; i < n; i++) {
      var fila = t.primera + i;
      if (objetivo[fila]) continue;
      if (norm(t.matriz[fila - 1][col.estado]) !== clave) continue;
      f.push(fondoEstado[i][0]); l.push(letraEstado[i][0]);
    }
    cacheEstado[clave] = f.length ? { fondo: moda(f), letra: moda(l) } : null;
    return cacheEstado[clave];
  }

  var escritas = 0, pintadas = 0, usados = {};
  for (var k = 0; k < updates.length; k++) {
    var fila = Number(updates[k].fila);
    var estado = String(updates[k].estado || "");
    if (!fila || !estado || fila < t.primera || fila > t.ultima) continue;

    var celdaEstado = hoja.getRange(fila, col.estado + 1);
    celdaEstado.setValue(estado);
    escritas++;

    var re = refEstado(estado);
    if (re) celdaEstado.setBackground(re.fondo).setFontColor(re.letra);

    var s = stockDe(fila);
    var rs = s === null ? null : refStock(s <= 0);
    if (rs) {
      hoja.getRange(fila, col.stock + 1).setBackground(rs.fondo).setFontColor(rs.letra);
      usados[s <= 0 ? "stock en 0" : "stock con unidades"] = rs.fondo;
    }
    if (re || rs) pintadas++;
  }

  return { ok: true, escritas: escritas, pintadas: pintadas, colores: usados };
}

/** Diagnóstico: estado, stock y colores de cada producto (solo lectura). */
function leerColores(hoja) {
  var t = ubicarTabla(hoja);
  if (!t) return { ok: false, error: "no se encontro la tabla" };
  var col = t.col;
  var n = t.ultima - t.primera + 1;
  var fe = hoja.getRange(t.primera, col.estado + 1, n, 1).getBackgrounds();
  var fs = col.stock != null ? hoja.getRange(t.primera, col.stock + 1, n, 1).getBackgrounds() : null;
  var filas = [];
  for (var i = 0; i < n; i++) {
    var f = t.primera + i;
    filas.push({
      fila: f,
      nombre: String(t.matriz[f - 1][col.nombre]),
      estado: String(t.matriz[f - 1][col.estado]),
      stock: col.stock != null ? t.matriz[f - 1][col.stock] : null,
      fondoStock: fs ? fs[i][0] : null,
      fondoEstado: fe[i][0]
    });
  }
  return { ok: true, filas: filas };
}

/** Mapa canónico → índice de columna (0-based). null si la fila no es el encabezado. */
function mapearColumnas(fila) {
  var col = {};
  for (var i = 0; i < fila.length; i++) {
    var h = norm(fila[i]);
    if (h === "nombre del articulo") col.nombre = i;
    else if (h === "tipo") col.tipo = i;
    else if (h === "stock disponible") col.stock = i;
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
