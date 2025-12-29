import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MemoryModule } from './memory/memory.module';
import { EntityModule } from './entity/entity.module';
import { RelationModule } from './relation/relation.module';
import { GraphModule } from './graph/graph.module';
import { ExtractModule } from './extract/extract.module';
import { HealthModule } from './health/health.module';

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
