import { Module } from '@nestjs/common';
import { SegmentService } from './segment.service';
import { SegmentController } from './segment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EnvironmentModule } from '../environment/environment.module';
import { AccessModule } from '../access/access.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AccessModule, EnvironmentModule, AuditLogModule],
  providers: [SegmentService],
  controllers: [SegmentController],
})
export class SegmentModule {}
