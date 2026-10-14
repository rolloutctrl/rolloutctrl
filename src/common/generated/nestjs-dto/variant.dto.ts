import { Prisma, VariantPayloadType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class VariantDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    enum: VariantPayloadType,
    enumName: 'VariantPayloadType',
    nullable: true,
  })
  payloadType: VariantPayloadType | null;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  payload: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
  })
  colorTag: string;
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
