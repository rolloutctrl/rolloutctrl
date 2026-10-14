import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class ProjectMemberProjectIdUserIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  projectId: string;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
}

@ApiExtraModels(ProjectMemberProjectIdUserIdUniqueInputDto)
export class ConnectProjectMemberDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: ProjectMemberProjectIdUserIdUniqueInputDto,
    required: false,
  })
  projectId_userId?: ProjectMemberProjectIdUserIdUniqueInputDto;
}
