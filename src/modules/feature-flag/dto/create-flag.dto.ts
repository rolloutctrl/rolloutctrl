import {
  IsString,
  IsOptional,
  Matches,
  Length,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SingleFlagDto {
  @ApiProperty({
    example: 'dark-mode',
    minLength: 2,
    maxLength: 100,
    description: 'Feature flag key (kebab-case or camelCase)',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)*$/)
  key: string;

  @ApiPropertyOptional({
    maxLength: 500,
    description: 'Feature flag description',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export enum CreateFlagType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export class CreateFeatureFlagRequestDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({
    enum: CreateFlagType,
    default: CreateFlagType.SINGLE,
    description: 'Creation type: single or multiple flags',
  })
  @IsEnum(CreateFlagType)
  type: CreateFlagType = CreateFlagType.SINGLE;

  @ApiPropertyOptional({
    example: 'dark-mode',
    minLength: 2,
    maxLength: 100,
    description: 'Feature flag key (required for single creation)',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  // @Matches(/^[a-z0-9.-]+$/)
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

  @ApiPropertyOptional({
    type: 'array',
    description: 'Array of flags (required for multiple creation)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleFlagDto)
  flags?: SingleFlagDto[];
}
