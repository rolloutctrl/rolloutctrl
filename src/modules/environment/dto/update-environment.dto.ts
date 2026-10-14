import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEnvironmentDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional({
    example: 'production',
    minLength: 2,
    maxLength: 100,
    description: 'Environment name (alphanumeric, spaces, _ and - allowed)',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z0-9 _-]+$/)
  name?: string;
}
