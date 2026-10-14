import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/common/generated/prisma/client';
import { NotificationService } from './services/notification.service';
import { NotificationStatus } from 'src/common/generated/prisma/enums';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NotificationSseService } from './services/notification-sse.service';
import { Observable } from 'rxjs';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly sseService: NotificationSseService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiOkResponse({ description: 'Paginated list of notifications' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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

  @Patch(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiOkResponse({ description: 'Notification marked as read' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiOkResponse({ description: 'All notifications marked as read' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Patch(':notificationId/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a notification' })
  @ApiOkResponse({ description: 'Notification archived successfully' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async archiveNotification(
    @CurrentUser() user: User,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.archiveNotification(
      notificationId,
      user.id,
    );
  }

  @Sse('unread-count')
  unreadCountSse(
    @CurrentUser() user: User,
  ): Observable<{ data: { count: number } }> {
    return this.sseService.getStream(user.id);
  }
}
