import { ApiProperty } from '@nestjs/swagger';

export class ConnectOrganizationDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
