import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class SegmentProjectIdKeyUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  projectId: string;
  @ApiProperty({
    type: 'string',
  })
  key: string;
}

@ApiExtraModels(SegmentProjectIdKeyUniqueInputDto)
export class ConnectSegmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: SegmentProjectIdKeyUniqueInputDto,
    required: false,
  })
  projectId_key?: SegmentProjectIdKeyUniqueInputDto;
}
