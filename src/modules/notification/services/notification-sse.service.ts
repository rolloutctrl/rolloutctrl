import { Injectable } from '@nestjs/common';
import { Observable, Subject, concat, defer, map } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationStatus } from 'src/common/generated/prisma/enums';

export interface UnreadCountData {
  count: number;
}

@Injectable()
export class NotificationSseService {
  private readonly streams = new Map<string, Subject<UnreadCountData>>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns an Observable that immediately emits the current unread count
   * and then pushes updated counts whenever `pushUnreadCount` is called.
   */
  getStream(userId: string): Observable<{ data: UnreadCountData }> {
    let subject = this.streams.get(userId);
    if (!subject) {
      subject = new Subject<UnreadCountData>();
      this.streams.set(userId, subject);
    }

    return concat(
      defer(() => this.fetchUnreadCount(userId)),
      subject.asObservable(),
    ).pipe(map((data) => ({ data })));
  }

  /**
   * Pushes the latest unread count to all active SSE subscribers for the user.
   */
  async pushUnreadCount(userId: string): Promise<void> {
    const subject = this.streams.get(userId);
    if (!subject || subject.closed) return;

    const data = await this.fetchUnreadCount(userId);
    subject.next(data);
  }

  private async fetchUnreadCount(userId: string): Promise<UnreadCountData> {
    const count = await this.prisma.notification.count({
      where: { userId, status: NotificationStatus.UNREAD },
    });
    return { count };
  }
}
