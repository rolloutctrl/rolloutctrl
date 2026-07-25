import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateOrganizationRequestDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200)
  url?: string;

  @IsOptional()
  @IsString()
  @Length(2, 400)
  description?: string;
}
