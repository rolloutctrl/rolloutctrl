import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MetricsService, METRICS_QUEUE } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsProcessor } from './metrics.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [BullModule.registerQueue({ name: METRICS_QUEUE }), PrismaModule],
  providers: [MetricsService, MetricsProcessor],
  controllers: [MetricsController],
  exports: [MetricsService],
})
export class MetricsModule {}
