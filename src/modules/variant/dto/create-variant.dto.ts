import {
  IsOptional,
  IsString,
  IsJSON,
  IsEnum,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { VariantPayloadType } from 'src/common/generated/prisma/enums';
import { VariantColors } from 'src/common/constants/variant.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantRequestDto {
  @ApiProperty({ example: 'Control', description: 'Variant name' })
  @IsString()
  name: string;

  @ApiProperty({
    enum: [...VariantColors],
    description: 'Color tag for the variant',
  })
  @IsIn(VariantColors)
  colorTag: string;

  @ApiPropertyOptional({ description: 'Variant description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: Object.values(VariantPayloadType),
    description: 'Payload type',
  })
  @IsOptional()
  @IsEnum(VariantPayloadType)
  payloadType?: VariantPayloadType;

  @ApiPropertyOptional({
    description: 'Variant payload (JSON string when payloadType is JSON)',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.payloadType === VariantPayloadType.JSON)
  @IsJSON()
  payload: any;

  @ApiProperty({ example: 'flag_123', description: 'Feature flag ID' })
  @IsString()
  featureFlagId: string;

  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsString()
  projectId: string;
}
