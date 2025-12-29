-- 启用扩展
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============ memories 表 ============
CREATE TABLE "memories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "embedding" vector(1024),
    "user_id" VARCHAR(64) NOT NULL,
    "agent_id" VARCHAR(64),
    "session_id" VARCHAR(64),
    "source" VARCHAR(32) NOT NULL DEFAULT 'conversation',
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extra_metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- memories 索引
CREATE INDEX "idx_memories_user_created" ON "memories"("user_id", "created_at" DESC);
CREATE INDEX "idx_memories_user_agent" ON "memories"("user_id", "agent_id");

-- memories 向量索引 (HNSW)
CREATE INDEX "idx_memories_embedding_hnsw" ON "memories"
    USING hnsw ("embedding" vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============ entities 表 ============
CREATE TABLE "entities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(32) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "embedding" vector(1024),
    "user_id" VARCHAR(64) NOT NULL,
    "source" VARCHAR(255),
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- entities 唯一约束和索引
ALTER TABLE "entities" ADD CONSTRAINT "uq_entity_user_type_name" UNIQUE ("user_id", "type", "name");
CREATE INDEX "idx_entities_user" ON "entities"("user_id");
CREATE INDEX "idx_entities_type" ON "entities"("user_id", "type");

-- entities 向量索引 (HNSW)
CREATE INDEX "idx_entities_embedding_hnsw" ON "entities"
    USING hnsw ("embedding" vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============ relations 表 ============
CREATE TABLE "relations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(64) NOT NULL,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "source_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "valid_from" TIMESTAMPTZ,
    "valid_to" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("id")
);

-- relations 外键
ALTER TABLE "relations" ADD CONSTRAINT "relations_source_id_fkey"
    FOREIGN KEY ("source_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "relations" ADD CONSTRAINT "relations_target_id_fkey"
    FOREIGN KEY ("target_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- relations 索引
CREATE INDEX "idx_relations_user" ON "relations"("user_id");
CREATE INDEX "idx_relations_source" ON "relations"("source_id");
CREATE INDEX "idx_relations_target" ON "relations"("target_id");
CREATE INDEX "idx_relations_type" ON "relations"("user_id", "type");
