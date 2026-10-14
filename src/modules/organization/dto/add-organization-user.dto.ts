import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { OrganizationRole, TeamRole } from 'src/common/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignUserToProjectDto {
  @ApiProperty({ example: 'proj_123', description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({
    enum: Object.values(TeamRole),
    description: 'Team role within the project',
  })
  @IsEnum(TeamRole)
  teamRole: TeamRole;
}

export class AddOrganizationUserRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'New user email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'New user password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'New user name' })
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
