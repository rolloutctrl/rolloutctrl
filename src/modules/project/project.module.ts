import { Module } from '@nestjs/common';
import { ProjectService } from './services/project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeyService } from './services/api-key.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [ProjectService, ApiKeyService],
  controllers: [ProjectController],
})
export class ProjectModule {}
