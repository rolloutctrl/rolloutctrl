import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/common/generated/prisma/client';
import { NotificationService } from './notification.service';
import { NotificationStatus } from 'src/common/generated/prisma/enums';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: User,
    @Query('status') status?: NotificationStatus,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.notificationService.getUserNotifications(user.id, {
      status: status as NotificationStatus | undefined,
      limit: limit ? parseInt(limit) : undefined,
      cursor,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':notificationId/read')
  async markAsRead(
    @CurrentUser() user: User,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Patch(':notificationId/archive')
  async archiveNotification(
    @CurrentUser() user: User,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.archiveNotification(
      notificationId,
      user.id,
    );
  }
}
