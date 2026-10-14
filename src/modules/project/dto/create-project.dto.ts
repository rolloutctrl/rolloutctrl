import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectRequestDto {
  @ApiProperty({
    example: 'My Project',
    minLength: 2,
    maxLength: 100,
    description: 'Project name',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    example: 'my-project',
    minLength: 2,
    maxLength: 100,
    description: 'Project slug (kebab-case or camelCase)',
  })
  @IsNotEmpty()
  @IsString()
  // @Matches(/^[a-z-]+$/)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)*$/)
  @Length(2, 100)
  slug: string;

  @ApiPropertyOptional({ maxLength: 500, description: 'Project description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
