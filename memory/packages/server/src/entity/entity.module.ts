import { Module } from '@nestjs/common';
import { EntityService } from './entity.service.js';
import { EntityController } from './entity.controller.js';
import { EmbeddingModule } from '../embedding/embedding.module.js';

@Module({
  imports: [EmbeddingModule],
  providers: [EntityService],
  controllers: [EntityController],
  exports: [EntityService],
})
export class EntityModule {}
