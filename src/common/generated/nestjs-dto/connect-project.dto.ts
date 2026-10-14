import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class ProjectSlugOrganizationIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  slug: string;
  @ApiProperty({
    type: 'string',
  })
  organizationId: string;
}

@ApiExtraModels(ProjectSlugOrganizationIdUniqueInputDto)
export class ConnectProjectDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  id?: string;
  @ApiProperty({
    type: ProjectSlugOrganizationIdUniqueInputDto,
    required: false,
  })
  slug_organizationId?: ProjectSlugOrganizationIdUniqueInputDto;
}
