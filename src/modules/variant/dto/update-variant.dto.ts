import { PartialType } from '@nestjs/swagger';
import { CreateVariantRequestDto } from './create-variant.dto';

export class UpdateVariantRequestDto extends PartialType(
  CreateVariantRequestDto,
) {}
