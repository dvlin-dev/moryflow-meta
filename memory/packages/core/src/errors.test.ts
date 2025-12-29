import { describe, it, expect } from 'vitest';
import {
  Ok,
  Err,
  MemoryErrorCode,
  createError,
  isMemoryError,
  tryCatchSync,
  unwrap,
  unwrapOr,
  mapResult,
  mapError,
  flatMapResultSync,
} from './errors';

describe('Result type', () => {
  describe('Ok', () => {
    it('should create a success result', () => {
      const result = Ok(42);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    it('should work with objects', () => {
      const result = Ok({ name: 'test' });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('test');
      }
    });
  });

  describe('Err', () => {
    it('should create an error result', () => {
      const error = createError(MemoryErrorCode.NOT_FOUND, 'Item not found');
      const result = Err(error);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe(MemoryErrorCode.NOT_FOUND);
        expect(result.error.message).toBe('Item not found');
      }
    });
  });
});

describe('createError', () => {
  it('should create an error with code and message', () => {
    const error = createError(MemoryErrorCode.VALIDATION_ERROR, 'Invalid input');
    expect(error.code).toBe(MemoryErrorCode.VALIDATION_ERROR);
    expect(error.message).toBe('Invalid input');
  });

  it('should include cause when provided', () => {
    const cause = new Error('Original error');
    const error = createError(MemoryErrorCode.QUERY_FAILED, 'Query failed', { cause });
    expect(error.cause).toBe(cause);
  });

  it('should include context when provided', () => {
    const error = createError(MemoryErrorCode.RATE_LIMITED, 'Rate limited', {
      context: { retryAfter: 60 },
    });
    expect(error.context).toEqual({ retryAfter: 60 });
  });
});

describe('isMemoryError', () => {
  it('should return true for valid MemoryError', () => {
    const error = createError(MemoryErrorCode.NOT_FOUND, 'Not found');
    expect(isMemoryError(error)).toBe(true);
  });

  it('should return false for non-MemoryError objects', () => {
    expect(isMemoryError({ message: 'test' })).toBe(false);
    expect(isMemoryError(null)).toBe(false);
    expect(isMemoryError(undefined)).toBe(false);
    expect(isMemoryError('error')).toBe(false);
    expect(isMemoryError(new Error('test'))).toBe(false);
  });
});

describe('tryCatchSync', () => {
  it('should return Ok for successful operations', () => {
    const result = tryCatchSync(() => 42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it('should return Err for throwing operations', () => {
    const result = tryCatchSync(() => {
      throw new Error('Test error');
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Test error');
      expect(result.error.code).toBe(MemoryErrorCode.UNKNOWN);
    }
  });

  it('should use custom error code', () => {
    const result = tryCatchSync(() => {
      throw new Error('Parse failed');
    }, MemoryErrorCode.PARSE_ERROR);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MemoryErrorCode.PARSE_ERROR);
    }
  });
});

describe('unwrap', () => {
  it('should return value for Ok result', () => {
    const result = Ok(42);
    expect(unwrap(result)).toBe(42);
  });

  it('should throw for Err result', () => {
    const error = createError(MemoryErrorCode.NOT_FOUND, 'Not found');
    const result = Err(error);
    expect(() => unwrap(result)).toThrow('Unwrap failed: Not found');
  });
});

describe('unwrapOr', () => {
  it('should return value for Ok result', () => {
    const result = Ok(42);
    expect(unwrapOr(result, 0)).toBe(42);
  });

  it('should return default for Err result', () => {
    const error = createError(MemoryErrorCode.NOT_FOUND, 'Not found');
    const result = Err(error);
    expect(unwrapOr(result, 0)).toBe(0);
  });
});

describe('mapResult', () => {
  it('should map Ok values', () => {
    const result = Ok(21);
    const mapped = mapResult(result, (x) => x * 2);
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(42);
    }
  });

  it('should pass through Err', () => {
    const error = createError(MemoryErrorCode.NOT_FOUND, 'Not found');
    const result = Err(error);
    const mapped = mapResult(result, (x: number) => x * 2);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error.code).toBe(MemoryErrorCode.NOT_FOUND);
    }
  });
});

describe('mapError', () => {
  it('should pass through Ok', () => {
    const result = Ok(42);
    const mapped = mapError(result, (e) => ({ ...e, code: MemoryErrorCode.UNKNOWN }));
    expect(mapped.ok).toBe(true);
    if (mapped.ok) {
      expect(mapped.value).toBe(42);
    }
  });

  it('should map Err values', () => {
    const error = createError(MemoryErrorCode.NOT_FOUND, 'Not found');
    const result = Err(error);
    const mapped = mapError(result, (e) => ({
      ...e,
      message: `Wrapped: ${e.message}`,
    }));
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error.message).toBe('Wrapped: Not found');
    }
  });
});

describe('flatMapResultSync', () => {
  it('should chain Ok results', () => {
    const result = Ok(21);
    const chained = flatMapResultSync(result, (x) => Ok(x * 2));
    expect(chained.ok).toBe(true);
    if (chained.ok) {
      expect(chained.value).toBe(42);
    }
  });

  it('should short-circuit on first Err', () => {
    const error = createError(MemoryErrorCode.NOT_FOUND, 'Not found');
    const result = Err(error);
    const chained = flatMapResultSync(result, (x: number) => Ok(x * 2));
    expect(chained.ok).toBe(false);
    if (!chained.ok) {
      expect(chained.error.code).toBe(MemoryErrorCode.NOT_FOUND);
    }
  });

  it('should propagate Err from chained function', () => {
    const result = Ok(42);
    const error = createError(MemoryErrorCode.VALIDATION_ERROR, 'Invalid');
    const chained = flatMapResultSync(result, () => Err(error));
    expect(chained.ok).toBe(false);
    if (!chained.ok) {
      expect(chained.error.code).toBe(MemoryErrorCode.VALIDATION_ERROR);
    }
  });
});
