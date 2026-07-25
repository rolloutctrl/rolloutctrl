import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_DELIVER_JOB,
} from './notification.constants';
import { NotificationJobData } from './notification.service';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from 'src/common/generated/prisma/enums';

@Processor(NOTIFICATION_QUEUE, { concurrency: 5 })
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    if (job.name !== NOTIFICATION_DELIVER_JOB) return;

    const { notificationId, channels } = job.data;

    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { notificationDeliveries: true },
    });

    if (!notification) {
      this.logger.warn(`Notification ${notificationId} not found, skipping`);
      return;
    }

    for (const channel of channels) {
      const delivery = notification.notificationDeliveries.find(
        (d) => d.channel === channel,
      );

      if (!delivery) continue;

      try {
        if (channel === NotificationChannel.IN_APP) {
          await this.deliverInApp(notification, delivery.id);
        } else {
          this.logger.warn(`Channel ${channel} is not supported yet`);
          await this.markDeliveryFailed(
            delivery.id,
            `Channel ${channel} is not supported`,
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to deliver notification ${notificationId} via ${channel}: ${errorMsg}`,
        );
        await this.markDeliveryFailed(delivery.id, errorMsg);
        throw error;
      }
    }
  }

  private async deliverInApp(
    notification: {
      id: string;
      title: string;
      message: string;
      link: string | null;
    },
    deliveryId: string,
  ): Promise<void> {
    await this.prisma.notificationDelivery.update({
      where: { id: deliveryId },
      data: {
        status: NotificationDeliveryStatus.SENT,
        sentAt: new Date(),
      },
    });

    this.logger.debug(
      `In-App notification ${notification.id} delivered (delivery ${deliveryId})`,
    );
  }

  private async markDeliveryFailed(
    deliveryId: string,
    error: string,
  ): Promise<void> {
    await this.prisma.notificationDelivery.update({
      where: { id: deliveryId },
      data: {
        status: NotificationDeliveryStatus.FAILED,
        error,
      },
    });
  }
}
