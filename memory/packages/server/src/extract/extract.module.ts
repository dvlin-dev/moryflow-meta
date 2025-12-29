import { Module } from '@nestjs/common';
import { ExtractService } from './extract.service.js';
import { LLMModule } from '../llm/llm.module.js';

@Module({
  imports: [LLMModule],
  providers: [ExtractService],
  exports: [ExtractService],
})
export class ExtractModule {}
