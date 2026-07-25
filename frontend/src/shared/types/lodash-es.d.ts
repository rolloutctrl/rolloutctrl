declare module 'lodash-es' {
  export function uniqueId(prefix?: string): string;
  export function castArray<T>(value: T | T[]): T[];
  export function castArray<T>(value: T | readonly T[]): readonly T[];
}
