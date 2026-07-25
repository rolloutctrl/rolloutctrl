import { IsNotEmpty, IsString } from 'class-validator';

export class CopySegmentToProjectDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  segmentId: string;
}
