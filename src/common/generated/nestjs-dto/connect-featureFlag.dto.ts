import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class FeatureFlagProjectIdKeyUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  projectId: string;
  @ApiProperty({
    type: 'string',
  })
  key: string;
}

@ApiExtraModels(FeatureFlagProjectIdKeyUniqueInputDto)
export class ConnectFeatureFlagDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: FeatureFlagProjectIdKeyUniqueInputDto,
    required: false,
  })
  projectId_key?: FeatureFlagProjectIdKeyUniqueInputDto;
}
