import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './notification.controller';
import { NotificationSseService } from './services/notification-sse.service';
import { NotificationProcessor } from './notification.processor';
import { NOTIFICATION_QUEUE } from './notification.constants';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    PrismaModule,
  ],
  providers: [
    NotificationService,
    NotificationSseService,
    NotificationProcessor,
  ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
