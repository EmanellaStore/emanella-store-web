import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const HF_TOKEN = process.env.HF_TOKEN!;
const MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

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

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-n8n-token');
  if (token !== process.env.N8N_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();  
  const query = body.query;  
  const limit = Math.min(Math.max(parseInt(body.limit) || 3, 1), 10);
  if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });

  const vector = await embed(query);
  const vectorStr = `[${vector.join(',')}]`;

  // Búsqueda semántica + unimos variantes e imágenes
  const results = await prisma.$queryRawUnsafe<any[]>(
    `
    SELECT 
      p.id, p.name, p.slug, p.category, p.description,
      (p.embedding <=> $1::vector) AS distance,
      json_agg(DISTINCT jsonb_build_object(
        'id', v.id, 'attributeValue', v.attribute_value, 
        'price', v.price, 'stock', v.stock
      )) AS variants,
      (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) AS image_url
    FROM products p
    LEFT JOIN product_variants v ON v.product_id = p.id AND v.stock > 0
    WHERE p.is_active = true AND p.embedding IS NOT NULL
    GROUP BY p.id
    ORDER BY distance ASC
    LIMIT $2
    `,
    vectorStr,
    limit
  );

  return NextResponse.json({ products: results });
}