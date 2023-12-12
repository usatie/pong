import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { GoogleUser } from './interfaces/user.interface';
import { GoogleToken } from './interfaces/token.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async loginOauth(user: GoogleUser | undefined): Promise<GoogleToken> {
    if (user === undefined) {
      throw new UnauthorizedException('Invalid user');
    }
    console.log('Googleから渡されたユーザーの情報です。', user);

    return {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    };
  }
}
