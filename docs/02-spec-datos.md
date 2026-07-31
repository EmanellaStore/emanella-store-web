# 02 · Spec de datos — Neon PostgreSQL + Prisma

DB: Neon (credenciales en `.env`: `DATABASE_URL` pooled + `DIRECT_URL`).
Regla: `prisma db push` solo tras confirmación; nunca destruir datos sin respaldo.

## Cambio principal: campos de perfumería en `Product`

En Shopify la PDP usa metafields `perfume.*`. Equivalente Prisma propuesto:

```prisma
model Product {
  // … campos existentes …
  notasSalida    String?  @map("notas_salida")     // "bergamota, pimienta rosa"
  notasCorazon   String?  @map("notas_corazon")
  notasFondo     String?  @map("notas_fondo")
  concentracion  String?                            // "Eau de Parfum"
  familia        String?                            // "Ámbar especiado"
  duracion       String?                            // "8–10 horas"
  inspiradoEn    String?  @map("inspirado_en")      // solo 1.1
  genero         String?                            // "Hombre" | "Dama" | "Unisex"
}
```

Notas:
- Todos opcionales → migración no destructiva (columnas nuevas nullable).
- `genero` convive con `category` actual; decidir si `category` ya cumple ese rol
  (revisar valores reales en la DB antes de duplicar).
- La pirámide olfativa y los chips de la PDP solo renderizan campos con dato.

## Impacto en código

- `src/lib/validators/` — ampliar schema de producto.
- `src/services/product.service.ts` — incluir campos en create/update/get.
- `src/components/admin/ProductForm` — inputs nuevos (sección "Perfil olfativo").
- API `products` — exponer campos en detalle (y en cards si aplica: familia/género).

## Población de datos (Decisión D4)

Opciones:
1. **Importar de Shopify** vía MCP Admin (productos + metafields `perfume.*`),
   mapeando por nombre/slug. Requiere que la tienda MCP conectada sea la de Emanella.
2. Manual desde el admin (más lento, pero revisa calidad).

## Otros (sin cambios de schema previstos)

- `Cart`/`CartItem` con estados (`ACTIVE…LOST`) ya soportan la recuperación — OK.
- `Coupon`/`CouponUse` ya soportan campañas — OK.
- `WhatsappMessage`, `Conversation` ya existen para el canal WhatsApp (Fase 6).
- `Review` ya existe (usada por Review Request y `/resena`).
