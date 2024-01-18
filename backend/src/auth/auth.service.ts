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

  redirectToOauth42 = (callbackUri: string) => {
    const client_id = process.env.OAUTH_42_CLIENT_ID;
    const redirect_uri = process.env.NEST_PUBLIC_API_URL + callbackUri;
    // TODO : implement state system for enhanced security
    const codeEndpointUrl = 'https://api.intra.42.fr/oauth/authorize';
    return {
      url: `${codeEndpointUrl}?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`,
    };
  };

  getAccessTokenWith42 = async ({
    code,
    redirect_uri,
  }: {
    code: string;
    redirect_uri;
  }) => {
    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.OAUTH_42_CLIENT_ID,
      client_secret: process.env.OAUTH_42_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.NEST_PUBLIC_API_URL + redirect_uri,
    });

    return fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((res) => {
      if (!res.ok) {
        return Promise.reject(res.statusText);
      }
      {
        return res.json().then((data) => {
          return data.access_token;
        });
      }
    });
  };

  getUserInfoWith42 = async ({ access_token }: { access_token: string }) => {
    return fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).then((res) => {
      if (!res.ok) {
        return Promise.reject(res.statusText);
      }
      return res.json();
    });
  };

  oauth42Callback = async (code: string): Promise<UserEntity> => {
    return this.getAccessTokenWith42({
      code,
      redirect_uri: '/auth/oauth2/signup/42/callback',
    })
      .catch((err) => {
        throw new Error(err);
      })
      .then((access_token) => {
        return this.getUserInfoWith42({ access_token })
          .catch(() => {
            throw new Error('Invalid user info');
          })
          .then(({ email, login }) => {
            if (!email || !login) {
              throw new Error('Invalid user info');
            }
            return this.prisma.user
              .findUnique({
                where: { email },
              })
              .then((user) => {
                if (user) {
                  throw new Error('User already exists');
                }
                const hashedPassword = bcrypt.hashSync(login, 10);
                // TODO : random password? without password?
                // TODO : save access_token in db
                const userData: CreateUserDto = {
                  email,
                  password: hashedPassword,
                  name: login,
                };
                return this.prisma.user.create({ data: userData });
              });
          });
      });
  };


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
