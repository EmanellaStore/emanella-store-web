// src/lib/google-sheets.ts — transporte hacia el Excel vía Google Apps Script.
// La organización bloquea las llaves de service account (iam.disableServiceAccount
// KeyCreation), así que en vez de la API REST de Sheets hablamos con un Web App de
// Apps Script pegado dentro del mismo Excel. El script corre con la cuenta dueña
// de la hoja (que ya tiene acceso) y se protege con un secreto compartido.
// Solo debe importarse desde código de servidor.

/** ¿Están configuradas la URL del script y el secreto? */
export function sheetsConfigurado(): boolean {
  return Boolean(
    process.env.INVENTARIO_SCRIPT_URL && process.env.INVENTARIO_SCRIPT_SECRET
  );
}

async function callScript(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const url = process.env.INVENTARIO_SCRIPT_URL?.trim();
  const secret = process.env.INVENTARIO_SCRIPT_SECRET;
  if (!url || !secret) throw new Error("SHEETS_NO_CONFIG");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, ...payload }),
      cache: "no-store",
      redirect: "follow", // Apps Script responde con un 302 a googleusercontent
    });
  } catch {
    throw new Error("SHEETS_API_ERROR: no se pudo contactar el script");
  }

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`SHEETS_API_ERROR: ${res.status} ${detalle.slice(0, 200)}`);
  }

  let data: Record<string, unknown>;
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    throw new Error("SHEETS_API_ERROR: respuesta no válida del script");
  }

  if (!data.ok) {
    const err = String(data.error ?? "");
    if (err === "unauthorized") throw new Error("SHEETS_AUTH_ERROR: secreto incorrecto");
    throw new Error(`SHEETS_API_ERROR: ${err || "el script devolvió un error"}`);
  }
  return data;
}

/** Lee la tabla principal: devuelve el título de la hoja y toda su matriz de valores. */
export async function leerHoja(): Promise<{ titulo: string; valores: unknown[][] }> {
  const data = await callScript({ action: "read" });
  return {
    titulo: String(data.titulo ?? ""),
    valores: (data.valores as unknown[][]) ?? [],
  };
}

export interface CeldaEscritura {
  rango: string; // A1 relativo a la primera hoja, p. ej. "D5"
  valor: string | number;
}

/** Escribe varias celdas de una vez. El script preserva el formato (moneda). */
export async function escribirCeldas(celdas: CeldaEscritura[]): Promise<void> {
  if (celdas.length === 0) return;
  await callScript({
    action: "write",
    updates: celdas.map((c) => ({ range: c.rango, value: c.valor })),
  });
}

/**
 * Agrega un producto nuevo al final de la tabla. El script inserta la fila,
 * copia las fórmulas de la fila de arriba y llena los campos recibidos.
 * Devuelve el número de fila creada.
 */
export async function agregarFila(
  valores: Record<string, string | number>
): Promise<number> {
  const data = await callScript({ action: "append", valores });
  return Number(data.fila);
}
