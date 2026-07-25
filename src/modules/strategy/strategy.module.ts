import { Module } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { StrategyController } from './strategy.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessModule } from '../access/access.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EnvironmentModule } from '../environment/environment.module';

@Module({
  imports: [PrismaModule, AccessModule, AuditLogModule, EnvironmentModule],
  providers: [StrategyService],
  controllers: [StrategyController],
})
export class StrategyModule {}
