import { IsNotEmpty, IsBoolean } from 'class-validator';

export class ToggleFlagFavoriteRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
