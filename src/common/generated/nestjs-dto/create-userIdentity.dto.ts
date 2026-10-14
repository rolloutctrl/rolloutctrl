import { AuthProvider } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserIdentityDto {
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
    required: false,
    nullable: true,
  })
  providerEmail?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  providerUsername?: string | null;
}
