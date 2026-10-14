import { IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationRequestDto {
  @ApiPropertyOptional({
    example: 'My Org',
    minLength: 2,
    maxLength: 100,
    description: 'Organization name',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com',
    minLength: 5,
    maxLength: 200,
    description: 'Organization URL',
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  url?: string;

  @ApiPropertyOptional({
    example: 'A great org',
    minLength: 2,
    maxLength: 400,
    description: 'Organization description',
  })
  @IsOptional()
  @IsString()
  @Length(2, 400)
  description?: string;
}
