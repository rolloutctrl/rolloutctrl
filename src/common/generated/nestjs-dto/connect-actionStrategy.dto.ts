import { ApiProperty } from '@nestjs/swagger';

export class ConnectActionStrategyDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
