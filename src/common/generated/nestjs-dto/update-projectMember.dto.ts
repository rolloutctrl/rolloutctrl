import { TeamRole } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectMemberDto {
  @ApiProperty({
    enum: TeamRole,
    enumName: 'TeamRole',
    required: false,
  })
  role?: TeamRole;
}
