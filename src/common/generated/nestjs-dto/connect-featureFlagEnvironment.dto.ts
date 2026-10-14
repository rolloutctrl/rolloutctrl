import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class FeatureFlagEnvironmentFeatureFlagIdEnvironmentIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  featureFlagId: string;
  @ApiProperty({
    type: 'string',
  })
  environmentId: string;
}

@ApiExtraModels(FeatureFlagEnvironmentFeatureFlagIdEnvironmentIdUniqueInputDto)
export class ConnectFeatureFlagEnvironmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: FeatureFlagEnvironmentFeatureFlagIdEnvironmentIdUniqueInputDto,
    required: false,
  })
  featureFlagId_environmentId?: FeatureFlagEnvironmentFeatureFlagIdEnvironmentIdUniqueInputDto;
}
