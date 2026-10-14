import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrganizationRole } from 'src/common/generated/prisma/enums';
import { AssignUserToProjectDto } from 'src/modules/organization/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'org_123', description: 'Organization ID' })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({
    enum: Object.values(OrganizationRole),
    description: 'Organization role',
  })
  @IsNotEmpty()
  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Project assignments',
  })
  @IsOptional()
  projects?: AssignUserToProjectDto[];
}
