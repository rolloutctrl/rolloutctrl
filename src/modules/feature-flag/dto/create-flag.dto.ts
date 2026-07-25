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

export class SingleFlagDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)*$/)
  key: string;

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
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsEnum(CreateFlagType)
  type: CreateFlagType = CreateFlagType.SINGLE;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  // @Matches(/^[a-z0-9.-]+$/)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^[a-z]+(?:[A-Z][a-z0-9]*)*$/)
  key?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleFlagDto)
  flags?: SingleFlagDto[];
}
