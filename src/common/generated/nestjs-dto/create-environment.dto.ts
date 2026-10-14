import { ApiProperty } from '@nestjs/swagger';

export class CreateEnvironmentDto {
  @ApiProperty({
    type: 'string',
  })
  name: string;
}
