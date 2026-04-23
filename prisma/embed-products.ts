import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function embed(text: string): Promise<number[]> {
    const res = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text
      })
    });
  
    const data = await res.json();
  
    if (!data.embedding) {
      throw new Error("Error generando embedding");
    }
  
    return data.embedding;
  }

async function main() {
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { variants: true },
    });

    console.log(`Procesando ${products.length} productos...`);

    for (const p of products) {
        const text = [
            p.name,
            p.category,
            p.description || '',
            p.variants.map(v => `${v.attributeName}: ${v.attributeValue}`).join(', '),
        ].join(' | ');

        try {
            const vector = await embed(text);
            const vectorStr = `[${vector.join(',')}]`;

            await prisma.$executeRawUnsafe(
                `UPDATE products SET embedding = $1::vector WHERE id = $2`,
                vectorStr,
                p.id
            );
            console.log(`✅ ${p.name}`);
        } catch (err) {
            console.error(`❌ ${p.name}:`, err);
        }
        await new Promise(r => setTimeout(r, 500)); // rate limit friendly
    }

    console.log('Done!');
    await prisma.$disconnect();
}

main();