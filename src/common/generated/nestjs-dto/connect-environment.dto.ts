import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class EnvironmentProjectIdNameUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  projectId: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
}

@ApiExtraModels(EnvironmentProjectIdNameUniqueInputDto)
export class ConnectEnvironmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: EnvironmentProjectIdNameUniqueInputDto,
    required: false,
  })
  projectId_name?: EnvironmentProjectIdNameUniqueInputDto;
}
