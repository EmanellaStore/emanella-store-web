import db from "@/lib/db";

/**
 * Genera el embedding de un texto usando Ollama (modelo nomic-embed-text).
 * Nota: Requiere que Ollama esté corriendo en el servidor/local.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.embedding) {
      throw new Error("No se recibió embedding de Ollama");
    }

    return data.embedding;
  } catch (err) {
    console.error("[AI] Error generando embedding:", err);
    throw err;
  }
}

/**
 * Actualiza el campo embedding de un producto en la base de datos.
 * Concatena nombre, categoría, descripción y variantes para crear el contexto.
 */
export async function updateProductEmbedding(productId: string) {
  try {
    const p = await db.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!p) return;

    // Solo generamos embedding si el producto está activo
    if (!p.isActive) {
      await db.$executeRawUnsafe(
        `UPDATE products SET embedding = NULL WHERE id = $1`,
        p.id
      );
      return;
    }

    const text = [
      p.name,
      p.category,
      p.description || "",
      p.variants.map((v) => `${v.attributeName}: ${v.attributeValue}`).join(", "),
    ].join(" | ");

    const vector = await generateEmbedding(text);
    const vectorStr = `[${vector.join(",")}]`;

    await db.$executeRawUnsafe(
      `UPDATE products SET embedding = $1::vector WHERE id = $2`,
      vectorStr,
      p.id
    );

    console.log(`[AI] Embedding actualizado para: ${p.name}`);
  } catch (err) {
    console.error(`[AI] Falló la actualización de embedding para ${productId}:`, err);
    // No lanzamos el error para no bloquear el flujo principal de guardado del producto,
    // pero se registra en logs.
  }
}
