import { NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

export async function GET() {
  try {
    const result = await getProducts({ page: 1, limit: 100, includeInactive: true });
    return NextResponse.json({ products: result.products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
