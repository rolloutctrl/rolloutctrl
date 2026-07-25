import { Module } from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { FeatureFlagController } from './feature-flag.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessModule } from '../access/access.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EnvironmentModule } from '../environment/environment.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    AccessModule,
    AuditLogModule,
    EnvironmentModule,
    NotificationModule,
  ],
  providers: [FeatureFlagService],
  controllers: [FeatureFlagController],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
