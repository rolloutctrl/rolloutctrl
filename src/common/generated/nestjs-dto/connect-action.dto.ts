import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class ActionProjectIdKeyUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  projectId: string;
  @ApiProperty({
    type: 'string',
  })
  key: string;
}

@ApiExtraModels(ActionProjectIdKeyUniqueInputDto)
export class ConnectActionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: ActionProjectIdKeyUniqueInputDto,
    required: false,
  })
  projectId_key?: ActionProjectIdKeyUniqueInputDto;
}
