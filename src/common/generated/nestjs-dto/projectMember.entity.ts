import { TeamRole } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { User } from './user.entity';

export class ProjectMember {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  projectId: string;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    enum: TeamRole,
    enumName: 'TeamRole',
  })
  role: TeamRole;
  @ApiProperty({
    type: () => Project,
    required: false,
  })
  project?: Project;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
}
