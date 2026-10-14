import { ApiProperty } from '@nestjs/swagger';

export class CreateActionDto {
  @ApiProperty({
    type: 'string',
  })
  key: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  description?: string | null;
}
