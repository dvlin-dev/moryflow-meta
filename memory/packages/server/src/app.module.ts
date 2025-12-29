import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { MemoryModule } from './memory/memory.module.js';
import { EntityModule } from './entity/entity.module.js';
import { RelationModule } from './relation/relation.module.js';
import { GraphModule } from './graph/graph.module.js';
import { ExtractModule } from './extract/extract.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    PrismaModule,
    MemoryModule,
    EntityModule,
    RelationModule,
    GraphModule,
    ExtractModule,
    HealthModule,
  ],
})
export class AppModule {}
