import { PartialType } from '@nestjs/mapped-types';
import { CreateStrategyRequestDto } from './create-strategy.dto';

export class UpdateStrategyRequestDto extends PartialType(
  CreateStrategyRequestDto,
) {}
