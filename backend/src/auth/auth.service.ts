import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { jwtConstants } from './auth.module';
import { OauthDto } from './dto/oauth.dto';
import { TwoFactorAuthenticationDto } from './dto/twoFactorAuthentication.dto';
import { TwoFactorAuthenticationEnableDto } from './dto/twoFactorAuthenticationEnable.dto';
import { AuthEntity } from './entity/auth.entity';

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
      accessToken: this.jwtService.sign({
        userId: user.id,
        isTwoFactorEnabled: user.twoFactorEnabled,
        isTwoFactorAuthenticated: false,
      }),
    };
  }

  async verifyAccessToken(accessToken: string) {
    const payload = await this.jwtService.verifyAsync(accessToken, {
      publicKey: jwtConstants.publicKey,
    });
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new NotFoundException(`No user found for id: ${payload.userId}`);
    }
    return user;
  }

  async generateTwoFactorAuthenticationSecret(userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user.twoFactorEnabled) {
        throw new ConflictException('2FA secret is already enabled');
      }
      const secret = authenticator.generateSecret();
      const otpAuthUrl = authenticator.keyuri(
        user.email,
        process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
        secret,
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret },
      });
      return { secret, otpAuthUrl };
    });
  }

  async signupWith42(dto: OauthDto): Promise<UserEntity> {
    // 1. Get access token
    const client_id = process.env.OAUTH_42_CLIENT_ID;
    const client_secret = process.env.OAUTH_42_CLIENT_SECRET;

    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id,
      client_secret,
      code: dto.code,
      redirect_uri: process.env.OAUTH_REDIRECT_URI,
      state: '42', // TODO : implement state system for enhanced security
    });

    const token = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
    const { access_token } = token;
    console.log('token', token);

    // 2. Get user info
    const userRes = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!userRes.ok) {
      throw new Error(userRes.statusText);
    }
    const userJson = await userRes.json();
    const { email, login } = userJson;
    if (!email || !login) {
      throw new Error('Invalid user info');
    }

    // 3. Create user
    const hashedPassword = await bcrypt.hash(login, 10);
    // TODO : random password? without password?
    // TODO : save access_token in db
    const userData: CreateUserDto = {
      email,
      password: hashedPassword,
      name: login,
    };
    return this.prisma.user.create({ data: userData });
  }

  async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(code: string, user: User) {
    return authenticator.verify({ token: code, secret: user.twoFactorSecret });
  }

  enableTwoFactorAuthentication(
    dto: TwoFactorAuthenticationEnableDto,
    userId: number,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (user.twoFactorEnabled) {
        throw new ConflictException('2FA secret is already enabled');
      }
      const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
        dto.code,
        user,
      );
      if (!isCodeValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });
      return {
        accessToken: this.jwtService.sign({
          userId: user.id,
          isTwoFactorEnabled: user.twoFactorEnabled,
          isTwoFactorAuthenticated: true,
        }),
      };
    });
  }

  async twoFactorAuthenticate(dto: TwoFactorAuthenticationDto, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user.twoFactorEnabled) {
      throw new ConflictException('2FA secret is not enabled');
    }
    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(dto.code, user);
    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    return {
      accessToken: this.jwtService.sign({
        userId: user.id,
        isTwoFactorEnabled: user.twoFactorEnabled,
        isTwoFactorAuthenticated: true,
      }),
    };
  }
}
