import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrganizationRole } from 'src/common/generated/prisma/enums';
import { AssignUserToProjectDto } from './add-organization-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationUserRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'password123', description: 'New password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    enum: Object.values(OrganizationRole),
    description: 'Organization role',
  })
  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @ApiPropertyOptional({
    type: 'array',
    description: 'Project assignments',
  })
  @IsArray()
  projects?: AssignUserToProjectDto[];
}
