import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantRequestDto } from './create-variant.dto';

export class UpdateVariantRequestDto extends PartialType(
  CreateVariantRequestDto,
) {}
