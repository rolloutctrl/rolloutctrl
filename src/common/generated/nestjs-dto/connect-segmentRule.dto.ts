import { ApiProperty } from '@nestjs/swagger';

export class ConnectSegmentRuleDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
