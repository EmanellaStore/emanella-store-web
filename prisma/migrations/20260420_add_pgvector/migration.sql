CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "embedding" vector(768);
CREATE INDEX IF NOT EXISTS "products_embedding_idx" 
  ON "products" USING hnsw ("embedding" vector_cosine_ops);