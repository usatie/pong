import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from './auth.module';

@Injectable()
export class JwtWithout2FAStrategy extends PassportStrategy(
  Strategy,
  'jwt-without-2fa',
) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.publicKey,
    });
  }

  async validate(payload: {
    userId: number;
    isTwoFactorAuthenticated: boolean;
  }) {
    const user = await this.userService.findOne(payload.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.publicKey,
    });
  }

  async validate(payload: {
    userId: number;
    isTwoFactorAuthenticated: boolean;
  }) {
    const user = await this.userService.findOne(payload.userId);

    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.twoFactorEnabled && !payload.isTwoFactorAuthenticated) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
