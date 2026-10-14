import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordRequestDto {
  @ApiProperty({
    example: 'newpassword123',
    minLength: 6,
    maxLength: 128,
    description: 'New password',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 128)
  password: string;
}
