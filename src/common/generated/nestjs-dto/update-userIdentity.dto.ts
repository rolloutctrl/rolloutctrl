import { AuthProvider } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserIdentityDto {
  @ApiProperty({
    enum: AuthProvider,
    enumName: 'AuthProvider',
    required: false,
  })
  provider?: AuthProvider;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  providerUserId?: string;
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
