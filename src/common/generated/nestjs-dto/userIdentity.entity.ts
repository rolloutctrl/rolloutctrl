import { AuthProvider } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class UserIdentity {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    enum: AuthProvider,
    enumName: 'AuthProvider',
  })
  provider: AuthProvider;
  @ApiProperty({
    type: 'string',
  })
  providerUserId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  providerEmail: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  providerUsername: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
}
