import { OrganizationRole } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  email?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  password?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  name?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  avatar?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  bio?: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  joinedAt?: Date | null;
  @ApiProperty({
    enum: OrganizationRole,
    enumName: 'OrganizationRole',
    required: false,
  })
  organizationRole?: OrganizationRole;
}
