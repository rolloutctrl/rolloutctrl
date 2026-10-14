import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CopySegmentToProjectDto {
  @ApiProperty({ example: 'proj_123', description: 'Target project ID' })
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty({ example: 'seg_123', description: 'Segment ID to copy' })
  @IsNotEmpty()
  @IsString()
  segmentId: string;
}
