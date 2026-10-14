import { ApiProperty } from '@nestjs/swagger';

export class EnvironmentDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'boolean',
  })
  isSystem: boolean;
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
    type: 'integer',
    format: 'int32',
  })
  version: number;
  @ApiProperty({
    type: 'boolean',
  })
  approveRequired: boolean;
}
