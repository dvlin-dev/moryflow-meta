import { Module } from '@nestjs/common';
import { ExtractService } from './extract.service';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [LLMModule],
  providers: [ExtractService],
  exports: [ExtractService],
})
export class ExtractModule {}
