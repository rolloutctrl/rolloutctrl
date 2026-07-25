import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateEnvironmentDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z0-9 _-]+$/)
  name: string;
}
