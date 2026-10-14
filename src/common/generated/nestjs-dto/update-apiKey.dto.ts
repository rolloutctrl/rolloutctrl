import { ApiKeyType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  name?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  keyHash?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  previewKey?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  environmentId?: string | null;
  @ApiProperty({
    enum: ApiKeyType,
    enumName: 'ApiKeyType',
    required: false,
  })
  type?: ApiKeyType;
  @ApiProperty({
    type: 'string',
    isArray: true,
    required: false,
  })
  allowedOrigins?: string[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  revokedAt?: Date | null;
}
