import { Module } from '@nestjs/common';
import { RelationService } from './relation.service.js';
import { RelationController } from './relation.controller.js';

@Module({
  providers: [RelationService],
  controllers: [RelationController],
  exports: [RelationService],
})
export class RelationModule {}
