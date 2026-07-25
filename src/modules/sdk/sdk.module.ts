import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MetricsModule } from '../metrics/metrics.module';
import { SdkClientController } from './controllers/sdk-client.controller';
import { SdkServerController } from './controllers/sdk-server.controller';
import { SdkService } from './services/sdk.service';
import { SdkServerService } from './services/sdk-server.service';
import { SdkKeyGuard } from './guards/sdk-key.guard';
import { SdkServerGuard } from './guards/sdk-server.guard';

@Module({
  imports: [PrismaModule, MetricsModule],
  controllers: [SdkClientController, SdkServerController],
  providers: [SdkService, SdkServerService, SdkKeyGuard, SdkServerGuard],
  exports: [SdkService, SdkServerService],
})
export class SdkModule {}
