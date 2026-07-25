import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto';
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_DELIVER_JOB,
} from './notification.constants';
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from 'src/common/generated/prisma/client';
import { OrganizationRole, TeamRole } from 'src/common/generated/prisma/enums';

export interface NotificationJobData {
  notificationId: string;
  channels: NotificationChannel[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    const channels = dto.channels ?? [NotificationChannel.IN_APP];

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        organizationId: dto.organizationId,
        type: dto.type,
        severity: dto.severity,
        title: dto.title,
        message: dto.message,
        link: dto.link,
        actorUserId: dto.actorUserId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        groupKey: dto.groupKey,
        notificationDeliveries: {
          create: channels.map((channel) => ({
            channel,
          })),
        },
      },
      include: { notificationDeliveries: true },
    });

    await this.notificationQueue.add(
      NOTIFICATION_DELIVER_JOB,
      {
        notificationId: notification.id,
        channels,
      },
      {
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 100 },
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    this.logger.log(
      `Notification ${notification.id} created and enqueued for delivery`,
    );

    return notification;
  }

  async notifyOrganizationOwnersAndAdmins(
    organizationId: string,
    data: Omit<CreateNotificationDto, 'userId' | 'organizationId'>,
  ) {
    const [owners, projectAdmins] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          organizationId,
          organizationRole: OrganizationRole.OWNER,
        },
        select: { id: true },
      }),
      this.prisma.projectMember.findMany({
        where: {
          role: TeamRole.ADMIN,
          project: { organizationId },
        },
        select: { userId: true },
      }),
    ]);

    const recipientIds = [
      ...new Set([
        ...owners.map((m) => m.id),
        ...projectAdmins.map((m) => m.userId),
      ]),
    ];

    if (recipientIds.length === 0) {
      this.logger.warn(
        `No owners or project admins found for organization ${organizationId}, skipping notification`,
      );
      return [];
    }

    const channels = data.channels ?? [NotificationChannel.IN_APP];

    const notifications = await this.prisma.$transaction(
      recipientIds.map((userId) =>
        this.prisma.notification.create({
          data: {
            userId,
            organizationId,
            type: data.type,
            severity: data.severity,
            title: data.title,
            message: data.message,
            link: data.link,
            actorUserId: data.actorUserId,
            entityType: data.entityType,
            entityId: data.entityId,
            metadata: data.metadata as Prisma.InputJsonValue | undefined,
            groupKey: data.groupKey,
            notificationDeliveries: {
              create: channels.map((channel) => ({ channel })),
            },
          },
          include: { notificationDeliveries: true },
        }),
      ),
    );

    await Promise.all(
      notifications.map((notification) =>
        this.notificationQueue.add(
          NOTIFICATION_DELIVER_JOB,
          { notificationId: notification.id, channels },
          {
            removeOnComplete: { count: 200 },
            removeOnFail: { count: 100 },
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
        ),
      ),
    );

    this.logger.log(
      `Notification sent to ${recipientIds.length} recipients (owners + project admins) for organization ${organizationId}`,
    );

    return notifications;
  }

  async getUserNotifications(
    userId: string,
    options?: {
      status?: NotificationStatus;
      limit?: number;
      cursor?: string;
    },
  ) {
    const limit = options?.limit ?? 50;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(options?.status ? { status: options.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        ...(options?.cursor ? { skip: 1, cursor: { id: options.cursor } } : {}),
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications: items,
      total,
      hasMore: items.length === limit,
      nextCursor: items.length === limit ? items[items.length - 1]?.id : null,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return { updated: result.count };
  }

  async archiveNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.ARCHIVED },
    });
  }
}
