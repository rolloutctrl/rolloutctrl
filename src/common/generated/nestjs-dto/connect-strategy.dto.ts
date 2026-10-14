import { ApiProperty } from '@nestjs/swagger';

export class ConnectStrategyDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
