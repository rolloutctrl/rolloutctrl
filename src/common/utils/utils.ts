export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function hashCode(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);

    // Convert to 32bit integer
    hash |= 0;
  }

  return Math.abs(hash);
}

type PercentageBucketInput = {
  key: string;
  stickinessValue: string | number;
};

export function getPercentageBucket({
  key,
  stickinessValue,
}: PercentageBucketInput): number {
  return hashCode(`${key}:${stickinessValue}`) % 100;
}

export function truncateString(str: string, length: number = 16) {
  const firstPart = str.slice(0, length);
  const lastPart = str.slice(-4);
  return `${firstPart}***${lastPart}`;
}
