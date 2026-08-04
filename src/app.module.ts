import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminThrottlerGuard } from './common/guards/admin-throttler.guard';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from './config/redis.config';
import corsConfig from './config/cors.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProjectModule } from './modules/project/project.module';
import { RedisModule } from './modules/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { AccessModule } from './modules/access/access.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FeatureFlagModule } from './modules/feature-flag/feature-flag.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { SegmentModule } from './modules/segment/segment.module';
import { ActionModule } from './modules/action/action.module';
import { EnvironmentModule } from './modules/environment/environment.module';
import { VariantModule } from './modules/variant/variant.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { SdkModule } from './modules/sdk/sdk.module';
import { NotificationModule } from './modules/notification/notification.module';
import { IoRedisThrottlerStorage } from './common/throttler/ioredis-throttler.storage';
import { ThrottlerStorage } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, corsConfig],
    }),
    PrismaModule,
    RedisModule,
    ThrottlerModule.forRootAsync({
      inject: ['REDIS_CLIENT'],
      useFactory: () => ({
        // Default throttler is intentionally generous (240 req/min per user)
        // so normal admin-panel usage (parallel list/detail/metrics requests)
        // never trips it. Stricter limits are applied per-route via @Throttle.
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 240,
          },
        ],
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.getOrThrow('redis');
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            maxRetriesPerRequest: null,
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    ProjectModule,
    AuthModule,
    AccessModule,
    UserModule,
    FeatureFlagModule,
    StrategyModule,
    OrganizationModule,
    SegmentModule,
    ActionModule,
    EnvironmentModule,
    VariantModule,
    MetricsModule,
    AuditLogModule,
    SdkModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ioredis-compatible ThrottlerStorage (replaces @nestjs-redis/throttler-storage
    // which targets node-redis, not ioredis v5).
    {
      provide: ThrottlerStorage,
      useClass: IoRedisThrottlerStorage,
    },
    // Global throttler guard. Runs after controller/method guards (e.g.
    // JwtAuthGuard), so req.user is populated and tracking is per-user.
    {
      provide: APP_GUARD,
      useClass: AdminThrottlerGuard,
    },
  ],
})
export class AppModule {}
