import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserRequestDto {
  @ApiProperty({
    example: 'John Doe',
    minLength: 3,
    maxLength: 120,
    description: 'User display name',
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 120)
  name: string;

  @ApiPropertyOptional({ maxLength: 1024, description: 'User bio' })
  @IsOptional()
  @IsString()
  @Length(2, 1024)
  bio?: string;
}
