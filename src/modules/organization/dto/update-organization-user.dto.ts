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

export class UpdateOrganizationUserRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @IsArray()
  projects?: AssignUserToProjectDto[];
}
