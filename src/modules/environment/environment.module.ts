import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EnvironmentService],
  controllers: [EnvironmentController],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
