import { IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStrategyVariantRequestDto {
  @ApiPropertyOptional({
    minimum: 0,
    maximum: 100,
    description: 'Weight percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @ApiPropertyOptional({ description: 'Whether custom weight is used' })
  @IsOptional()
  @IsBoolean()
  isCustomWeight?: boolean;
}
