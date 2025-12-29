/**
 * Result type for explicit error handling
 * Inspired by Rust's Result<T, E>
 */
export type Result<T, E = MemoryError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Create a success result
 */
export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/**
 * Create an error result
 */
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * Error codes for categorized error handling
 */
export enum MemoryErrorCode {
  // Storage errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',

  // Vector errors
  EMBEDDING_FAILED = 'EMBEDDING_FAILED',
  DIMENSION_MISMATCH = 'DIMENSION_MISMATCH',
  INVALID_VECTOR = 'INVALID_VECTOR',

  // Graph errors
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  RELATION_NOT_FOUND = 'RELATION_NOT_FOUND',
  INVALID_RELATION = 'INVALID_RELATION',
  CYCLE_DETECTED = 'CYCLE_DETECTED',
  MAX_DEPTH_EXCEEDED = 'MAX_DEPTH_EXCEEDED',

  // Extraction errors
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  LLM_ERROR = 'LLM_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Rate limiting
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  // Generic
  UNKNOWN = 'UNKNOWN',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Memory module error interface
 */
export interface MemoryError {
  code: MemoryErrorCode;
  message: string;
  cause?: Error;
  context?: Record<string, unknown>;
}

/**
 * Factory function to create errors
 */
export function createError(
  code: MemoryErrorCode,
  message: string,
  options?: { cause?: Error; context?: Record<string, unknown> },
): MemoryError {
  return {
    code,
    message,
    cause: options?.cause,
    context: options?.context,
  };
}

/**
 * Type guard to check if a value is a MemoryError
 */
export function isMemoryError(value: unknown): value is MemoryError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    Object.values(MemoryErrorCode).includes((value as MemoryError).code)
  );
}

/**
 * Wrap an async function to return a Result
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode: MemoryErrorCode = MemoryErrorCode.UNKNOWN,
): Promise<Result<T>> {
  try {
    const value = await fn();
    return Ok(value);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));
    return Err(createError(errorCode, cause.message, { cause }));
  }
}

/**
 * Wrap a sync function to return a Result
 */
export function tryCatchSync<T>(
  fn: () => T,
  errorCode: MemoryErrorCode = MemoryErrorCode.UNKNOWN,
): Result<T> {
  try {
    const value = fn();
    return Ok(value);
  } catch (error) {
    const cause = error instanceof Error ? error : new Error(String(error));
    return Err(createError(errorCode, cause.message, { cause }));
  }
}

/**
 * Unwrap a Result or throw an error
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value;
  }
  throw new Error(`Unwrap failed: ${result.error.message}`);
}

/**
 * Unwrap a Result or return a default value
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/**
 * Map a successful result to a new value
 */
export function mapResult<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  if (result.ok) {
    return Ok(fn(result.value));
  }
  return result;
}

/**
 * Chain multiple Result operations
 */
export async function flatMapResult<T, U>(
  result: Result<T>,
  fn: (value: T) => Promise<Result<U>>,
): Promise<Result<U>> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}
