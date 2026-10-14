import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnvironmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  name?: string;
}
