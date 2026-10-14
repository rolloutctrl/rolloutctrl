import { IsNotEmpty, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleStrategyEnableRequestDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({
    example: true,
    description: 'Whether the strategy is enabled',
  })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
