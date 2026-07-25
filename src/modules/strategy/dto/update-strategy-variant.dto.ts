import { IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export class UpdateStrategyVariantRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isCustomWeight?: boolean;
}
