import { ApiProperty } from '@nestjs/swagger';

export class ConnectNotificationDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
