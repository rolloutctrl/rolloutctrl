import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { OrganizationRole, TeamRole } from 'src/common/generated/prisma/enums';

export class AssignUserToProjectDto {
  @IsString()
  projectId: string;

  @IsEnum(TeamRole)
  teamRole: TeamRole;
}

export class AddOrganizationUserRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @IsArray()
  projects?: AssignUserToProjectDto[];
}
