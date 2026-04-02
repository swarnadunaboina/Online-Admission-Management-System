import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'secret'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    try {
      const user = await this.usersService.findOne(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('User not found or account suspended');
      }
      return { _id: user._id, email: user.email, role: user.role, name: user.name };
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
