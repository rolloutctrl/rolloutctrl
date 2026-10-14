import { ApiProperty } from '@nestjs/swagger';

export class ConnectExposureEventDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
