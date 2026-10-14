import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '../prisma/client';

export class UserIdentityProviderProviderUserIdUniqueInputDto {
  @ApiProperty({
    enum: AuthProvider,
    enumName: 'AuthProvider',
  })
  provider: AuthProvider;
  @ApiProperty({
    type: 'string',
  })
  providerUserId: string;
}

@ApiExtraModels(UserIdentityProviderProviderUserIdUniqueInputDto)
export class ConnectUserIdentityDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: UserIdentityProviderProviderUserIdUniqueInputDto,
    required: false,
  })
  provider_providerUserId?: UserIdentityProviderProviderUserIdUniqueInputDto;
}
