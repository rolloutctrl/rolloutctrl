import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class ToggleFeatureFlagRequestDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  flagId: string;

  @IsNotEmpty()
  @IsString()
  environmentId: string;

  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
