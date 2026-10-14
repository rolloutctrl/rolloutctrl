import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    type: 'string',
  })
  refreshTokenHash: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  expiresAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  revokedAt?: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  lastUsedAt?: Date | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  ip?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  userAgent?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  deviceName?: string | null;
}
