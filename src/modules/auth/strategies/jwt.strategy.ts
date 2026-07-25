import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtSessionPayload } from 'src/common/types/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtSessionPayload) {
    if (!payload?.sub || !payload?.sessionId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        projectMembers: {
          include: {
            project: {
              select: {
                id: true,
                slug: true,
              },
            },
          },
        },
      },
      omit: {
        password: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      ...payload,
      user,
    };
  }
}
