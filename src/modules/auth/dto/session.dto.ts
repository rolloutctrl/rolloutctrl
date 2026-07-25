import { Session } from 'src/common/generated/prisma/client';

export type SessionWithoutRefreshToken = Omit<Session, 'refreshTokenHash'> & {
  isCurrent: boolean;
};

export class SessionsListResponseDto {
  sessions: SessionWithoutRefreshToken[];
  total: number;
}
