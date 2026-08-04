/**
 * Minimal ioredis-compatible mock. Each command is a jest.fn() so tests
 * can assert call args and pre-program return values per-test.
 */
export interface MockRedis {
  get: jest.Mock;
  set: jest.Mock;
  setex: jest.Mock;
  del: jest.Mock;
  keys: jest.Mock;
  hset: jest.Mock;
  hget: jest.Mock;
  hgetall: jest.Mock;
  expire: jest.Mock;
  incr: jest.Mock;
  pipeline: jest.Mock;
  multi: jest.Mock;
  exec: jest.Mock;
  quit: jest.Mock;
  disconnect: jest.Mock;
}

export function createMockRedis(overrides: Partial<MockRedis> = {}): MockRedis {
  const pipelineMock = {
    set: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  };

  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    hset: jest.fn().mockResolvedValue(1),
    hget: jest.fn().mockResolvedValue(null),
    hgetall: jest.fn().mockResolvedValue({}),
    expire: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    pipeline: jest.fn().mockReturnValue(pipelineMock),
    multi: jest.fn().mockReturnValue(pipelineMock),
    exec: jest.fn().mockResolvedValue([]),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
    ...overrides,
  };
}
