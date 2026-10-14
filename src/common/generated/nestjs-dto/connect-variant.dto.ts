import { ApiProperty } from '@nestjs/swagger';

export class ConnectVariantDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}
