import { ApiProperty } from '@nestjs/swagger';

export class ConnectActionStrategyRuleDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
