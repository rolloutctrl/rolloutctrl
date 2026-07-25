import { IsNotEmpty, IsBoolean, IsString } from 'class-validator';

export class ToggleStrategyEnableRequestDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
