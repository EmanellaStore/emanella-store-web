/**
 * Inventario Emanella — Web App de Google Apps Script.
 *
 * Se pega dentro del MISMO Excel del inventario (Extensiones → Apps Script).
 * La app Next.js le habla por su URL (/exec) y este script lee/escribe la
 * primera hoja. No usa service accounts ni Google Cloud: corre con la cuenta
 * dueña de la hoja. Se protege con un secreto compartido.
 *
 * Pasos: ver docs/07-inventario-conexion-google.md
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

    return json({ ok: false, error: "accion desconocida" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
