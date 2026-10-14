import { TeamRole } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectMemberDto {
  @ApiProperty({
    enum: TeamRole,
    enumName: 'TeamRole',
  })
  role: TeamRole;
}
