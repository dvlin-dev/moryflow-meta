-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create vector index function (to be called after Prisma migration)
-- This creates HNSW index for efficient similarity search
CREATE OR REPLACE FUNCTION create_vector_indexes() RETURNS void AS $$
BEGIN
  -- Check if memories table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'memories') THEN
    -- Create HNSW index on memories.embedding if not exists
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_memories_embedding_hnsw') THEN
      EXECUTE 'CREATE INDEX idx_memories_embedding_hnsw ON memories USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)';
      RAISE NOTICE 'Created HNSW index on memories.embedding';
    END IF;
  END IF;

  -- Check if entities table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'entities') THEN
    -- Create HNSW index on entities.embedding if not exists
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_entities_embedding_hnsw') THEN
      EXECUTE 'CREATE INDEX idx_entities_embedding_hnsw ON entities USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)';
      RAISE NOTICE 'Created HNSW index on entities.embedding';
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Output confirmation
DO $$
BEGIN
  RAISE NOTICE 'PostgreSQL initialized with pgvector extension';
  RAISE NOTICE 'Run SELECT create_vector_indexes(); after Prisma migration to create HNSW indexes';
END $$;
