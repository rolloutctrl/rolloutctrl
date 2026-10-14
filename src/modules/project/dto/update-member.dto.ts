import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TeamRole } from 'src/common/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectMemberAccessRequestDto {
  @ApiProperty({ example: 'pm_123', description: 'Project member ID' })
  @IsNotEmpty()
  @IsString()
  projectMemberId: string;

  @ApiProperty({ enum: Object.values(TeamRole), description: 'New team role' })
  @IsEnum(TeamRole)
  role: TeamRole;
}
