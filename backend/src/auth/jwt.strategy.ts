import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from './auth.module';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
	super({
	  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	  secretOrKey: jwtConstants.secret,
	});
  }

  async validate(payload: { userId: number }) {
	const user = await this.userService.findOne(payload.userId);

	if (!user) {
	  throw new UnauthorizedException();
	}

	return user;
  }
}
