import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TeamRole } from 'src/common/generated/prisma/enums';

export class UpdateProjectMemberAccessRequestDto {
  @IsNotEmpty()
  @IsString()
  projectMemberId: string;

  @IsEnum(TeamRole)
  role: TeamRole;
}
