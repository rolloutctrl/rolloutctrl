import { ConfigService } from '@nestjs/config';

type ConfigMap = Record<string, unknown>;

/**
 * ConfigService mock backed by a plain object. `getOrThrow` throws if
 * the key is missing (mirrors real behavior), `get` returns undefined.
 */
export function createMockConfigService(
  values: ConfigMap = {},
): jest.Mocked<ConfigService> {
  const get = jest.fn((key: string) => values[key]);
  const getOrThrow = jest.fn((key: string) => {
    if (!(key in values)) {
      throw new Error(`Config key "${key}" not set in mock`);
    }
    return values[key];
  });
  return {
    get,
    getOrThrow,
    // expose internal map for debugging/overrides in tests
    _values: values,
  } as unknown as jest.Mocked<ConfigService>;
}
