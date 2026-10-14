import { ApiProperty } from '@nestjs/swagger';

export class ConnectStrategyRuleDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
