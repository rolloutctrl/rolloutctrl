import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 120)
  name: string;

  @IsOptional()
  @IsString()
  @Length(2, 1024)
  bio?: string;
}
