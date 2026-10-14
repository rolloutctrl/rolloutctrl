import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleFeatureFlagRequestDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({ example: 'flag_123', description: 'Feature flag ID' })
  @IsNotEmpty()
  @IsString()
  flagId: string;

  @ApiProperty({ example: 'env_123', description: 'Environment ID' })
  @IsNotEmpty()
  @IsString()
  environmentId: string;

  @ApiProperty({ example: true, description: 'Whether the flag is enabled' })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
