import { ApiProperty } from '@nestjs/swagger';

export class UpdateStrategyDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  name?: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  rolloutPercentage?: number | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  rolloutStickinessField?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  timezone?: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  startsAt?: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  endsAt?: Date | null;
}
