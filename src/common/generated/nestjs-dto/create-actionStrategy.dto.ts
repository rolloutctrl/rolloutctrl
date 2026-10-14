import { ActionEffect } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActionStrategyDto {
  @ApiProperty({
    enum: ActionEffect,
    enumName: 'ActionEffect',
  })
  effect: ActionEffect;
}
