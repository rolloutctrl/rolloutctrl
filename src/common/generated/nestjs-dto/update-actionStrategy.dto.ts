import { ActionEffect } from '../prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateActionStrategyDto {
  @ApiProperty({
    enum: ActionEffect,
    enumName: 'ActionEffect',
    required: false,
  })
  effect?: ActionEffect;
}
