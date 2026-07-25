import { Module } from '@nestjs/common';
import { VariantService } from './variant.service';
import { VariantController } from './variant.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessModule } from '../access/access.module';
import { EnvironmentModule } from '../environment/environment.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AccessModule, EnvironmentModule, AuditLogModule],
  providers: [VariantService],
  controllers: [VariantController],
})
export class VariantModule {}
