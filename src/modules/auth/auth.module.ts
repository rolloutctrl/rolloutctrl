import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';

// PassportModule.register({}) provides AuthModuleOptions, which is injected
// (with @Optional()) by every AuthGuard-based guard (JwtAuthGuard, JwtRefreshGuard).
// NestJS v11+ no longer deduplicates dynamic modules by hash, so the registered
// PassportModule must be explicitly shared. AuthModule is @Global() and exports
// passportModule so AuthModuleOptions is available in every module that uses
// those guards (AuditLogModule, StrategyModule, etc.) without re-importing.
const passportModule = PassportModule.register({});

@Global()
@Module({
  imports: [ConfigModule, PrismaModule, passportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService, passportModule],
})
export class AuthModule {}
