import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'abc123token',
    description: 'Email verification token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
