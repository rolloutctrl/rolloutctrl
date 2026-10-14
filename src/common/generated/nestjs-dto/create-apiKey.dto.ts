import { ApiKeyType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  keyHash: string;
  @ApiProperty({
    type: 'string',
  })
  previewKey: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  environmentId?: string | null;
  @ApiProperty({
    enum: ApiKeyType,
    enumName: 'ApiKeyType',
  })
  type: ApiKeyType;
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  allowedOrigins: string[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  revokedAt?: Date | null;
}
