import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFeatureFlagRequestDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional({
    example: 'dark-mode',
    minLength: 2,
    maxLength: 100,
    description: 'Feature flag key (kebab-case or camelCase)',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)*$/)
  key?: string;

  @ApiPropertyOptional({
    maxLength: 500,
    description: 'Feature flag description',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the flag is archived' })
  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
