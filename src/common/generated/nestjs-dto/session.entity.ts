import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class Session {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: 'string',
  })
  refreshTokenHash: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  expiresAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  revokedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  lastUsedAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  ip: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userAgent: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  deviceName: string | null;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
}
