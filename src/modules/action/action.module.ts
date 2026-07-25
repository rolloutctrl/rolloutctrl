import { Module } from '@nestjs/common';
import { ActionService } from './action.service';
import { ActionController } from './action.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessModule } from '../access/access.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EnvironmentModule } from '../environment/environment.module';

@Module({
  imports: [PrismaModule, AccessModule, AuditLogModule, EnvironmentModule],
  providers: [ActionService],
  controllers: [ActionController],
})
export class ActionModule {}
