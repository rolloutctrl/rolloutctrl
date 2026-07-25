import { IsNotEmpty, IsString } from 'class-validator';

export class TransferOwnershipRequestDto {
  @IsNotEmpty()
  @IsString()
  newOwnerId: string;
}
