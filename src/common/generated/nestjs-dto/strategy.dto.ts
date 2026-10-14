import { MatchType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class StrategyDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'boolean',
  })
  isDefault: boolean;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name: string | null;
  @ApiProperty({
    type: 'boolean',
  })
  enabled: boolean;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  rolloutPercentage: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  rolloutStickinessField: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  timezone: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  startsAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  endsAt: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  priority: number;
  @ApiProperty({
    enum: MatchType,
    enumName: 'MatchType',
  })
  matchType: MatchType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'boolean',
  })
  isArchived: boolean;
}
