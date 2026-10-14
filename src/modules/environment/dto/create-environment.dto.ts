import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnvironmentDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({
    example: 'production',
    minLength: 2,
    maxLength: 100,
    description: 'Environment name (alphanumeric, spaces, _ and - allowed)',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z0-9 _-]+$/)
  name: string;
}
