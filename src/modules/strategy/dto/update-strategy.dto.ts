import { PartialType } from '@nestjs/swagger';
import { CreateStrategyRequestDto } from './create-strategy.dto';

export class UpdateStrategyRequestDto extends PartialType(
  CreateStrategyRequestDto,
) {}
