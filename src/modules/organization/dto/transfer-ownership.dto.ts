import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferOwnershipRequestDto {
  @ApiProperty({ example: 'user_456', description: 'ID of the new owner' })
  @IsNotEmpty()
  @IsString()
  newOwnerId: string;
}
