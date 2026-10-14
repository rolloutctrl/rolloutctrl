import { Session } from 'src/common/generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export type SessionWithoutRefreshToken = Omit<Session, 'refreshTokenHash'> & {
  isCurrent: boolean;
};

export class SessionsListResponseDto {
  @ApiProperty({
    type: 'array',
    description: 'List of user sessions',
  })
  sessions: SessionWithoutRefreshToken[];

  @ApiProperty({ example: 3, description: 'Total number of sessions' })
  total: number;
}
