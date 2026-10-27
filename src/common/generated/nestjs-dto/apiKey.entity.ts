import { ApiKeyType } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Project } from './project.entity';

export class ApiKey {
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
  name: string;
  @ApiProperty({
    type: 'string',
  })
  keyHash: string;
  @ApiProperty({
    type: 'string',
  })
  previewKey: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  environmentId: string | null;
  @ApiProperty({
    enum: ApiKeyType,
    enumName: 'ApiKeyType',
  })
  type: ApiKeyType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userId: string | null;
  @ApiProperty({
    type: () => User,
    required: false,
    nullable: true,
  })
  user?: User | null;
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  allowedOrigins: string[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  revokedAt: Date | null;
  @ApiProperty({
    type: () => Project,
    required: false,
  })
  project?: Project;
}
