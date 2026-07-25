import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateEnvironmentDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z0-9 _-]+$/)
  name?: string;
}
