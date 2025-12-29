/**
 * Zod Validation Pipe
 * NestJS pipe for validating request data with Zod schemas
 */
import { PipeTransform, BadRequestException } from '@nestjs/common';
import type { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(this.formatError(result.error));
    }
    return result.data;
  }

  private formatError(error: ZodError): string {
    return error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
  }
}
