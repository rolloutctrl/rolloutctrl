import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.getOrThrow('redis.host'),
          port: configService.getOrThrow('redis.port'),
          // username: configService.get('REDIS_USERNAME'),
          // password: configService.get('REDIS_PASSWORD'),
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          lazyConnect: true,
          readOnly: false,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true;
            }
            return false;
          },
          connectTimeout: 10000,
          commandTimeout: 5000,
        });

        redis.on('error', (err) => {
          console.error('Redis error:', err.message);
        });

        redis.on('connect', () => {
          console.log('Connected to Redis');
        });

        redis.on('reconnecting', () => {
          console.log('Reconnecting to Redis...');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
