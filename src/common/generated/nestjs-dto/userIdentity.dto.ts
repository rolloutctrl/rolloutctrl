import { AuthProvider } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserIdentityDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
}
