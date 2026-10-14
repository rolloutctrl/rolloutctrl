import { ApiProperty } from '@nestjs/swagger';

export class UpdateActionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  key?: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  description?: string | null;
}
