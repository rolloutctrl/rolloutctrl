import { Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessController } from './access.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AccessController],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
