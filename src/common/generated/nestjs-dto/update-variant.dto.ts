import { Prisma, VariantPayloadType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVariantDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  name?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  description?: string | null;
  @ApiProperty({
    enum: VariantPayloadType,
    enumName: 'VariantPayloadType',
    required: false,
    nullable: true,
  })
  payloadType?: VariantPayloadType | null;
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  payload?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  colorTag?: string;
}
