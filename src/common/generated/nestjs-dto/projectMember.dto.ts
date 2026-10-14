import { TeamRole } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectMemberDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    enum: TeamRole,
    enumName: 'TeamRole',
  })
  role: TeamRole;
}
