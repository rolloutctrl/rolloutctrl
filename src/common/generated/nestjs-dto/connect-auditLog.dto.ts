import { ApiProperty } from '@nestjs/swagger';

export class ConnectAuditLogDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
