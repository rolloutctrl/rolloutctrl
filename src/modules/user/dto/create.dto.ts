import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrganizationRole } from 'src/common/generated/prisma/enums';
import { AssignUserToProjectDto } from 'src/modules/organization/dto';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @IsNotEmpty()
  @IsEnum(OrganizationRole)
  role: OrganizationRole;

  @IsOptional()
  projects?: AssignUserToProjectDto[];
}
