import { ApiProperty } from '@nestjs/swagger';

export class ConnectSessionDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
