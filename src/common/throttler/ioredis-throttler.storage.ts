import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

/**
 * ioredis-compatible ThrottlerStorage for @nestjs/throttler.
 *
 * The official @nestjs-redis/throttler-storage package targets node-redis
 * (which has client.scriptLoad), not ioredis v5. This implementation uses
 * the ioredis API (client.script('LOAD', ...) / evalsha / eval) directly.
 *
 * Uses an atomic Lua script for the increment+expire operation.
 */
@Injectable()
export class IoRedisThrottlerStorage
  implements ThrottlerStorage, OnModuleDestroy
{
  private readonly prefix = '_throttler';
  private scriptSha: string | null = null;

  // Atomic fixed-window increment in Lua.
  // Returns: { totalHits, timeToExpireSec, timeToBlockExpireSec, isBlocked }
  private readonly luaScript = `local key = KEYS[1]
local ttlMs = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local blockDurationMs = tonumber(ARGV[3])
local hits = redis.call('INCR', key)
if hits == 1 then
  redis.call('PEXPIRE', key, ttlMs)
end
local ttl = redis.call('PTTL', key)
local isBlocked = 0
local blockTtl = -1
if hits > limit then
  isBlocked = 1
  blockTtl = ttl
end
return { hits, ttl, blockTtl, isBlocked }`;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private async loadScript(): Promise<string> {
    if (this.scriptSha) return this.scriptSha;
    const result = await this.redis.script('LOAD', this.luaScript);
    this.scriptSha = result as string;
    return this.scriptSha;
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const redisKey = `${this.prefix}:{${key}}:${throttlerName}`;
    const ttlMs = ttl.toString();
    const limitStr = limit.toString();
    const blockDurationMs = (blockDuration ?? ttl).toString();

    let result: [number, number, number, number];

    try {
      const sha = await this.loadScript();
      result = (await this.redis.evalsha(
        sha,
        1,
        redisKey,
        ttlMs,
        limitStr,
        blockDurationMs,
      )) as [number, number, number, number];
    } catch (error: any) {
      // NOSCRIPT — script was flushed, reload and retry
      if (error?.message?.includes('NOSCRIPT')) {
        this.scriptSha = null;
        result = (await this.redis.eval(
          this.luaScript,
          1,
          redisKey,
          ttlMs,
          limitStr,
          blockDurationMs,
        )) as [number, number, number, number];
      } else {
        throw error;
      }
    }

    const [totalHits, timeToExpireMs, timeToBlockExpireMs, isBlocked] = result;

    return {
      totalHits,
      timeToExpire: timeToExpireMs > 0 ? Math.ceil(timeToExpireMs / 1000) : -1,
      isBlocked: isBlocked === 1,
      timeToBlockExpire:
        timeToBlockExpireMs > 0 ? Math.ceil(timeToBlockExpireMs / 1000) : -1,
    };
  }

  onModuleDestroy() {
    // Redis client lifecycle is managed by RedisModule, not here.
  }
}
