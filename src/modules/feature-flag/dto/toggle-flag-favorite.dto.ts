import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleFlagFavoriteRequestDto {
  @ApiProperty({ example: true, description: 'Whether the flag is favorited' })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;
}
