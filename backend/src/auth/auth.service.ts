import {
  ConflictException,
  HttpException,
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
import { jwtConstants } from './auth.module';
import { TwoFactorAuthenticationDto } from './dto/twoFactorAuthentication.dto';
import { TwoFactorAuthenticationEnableDto } from './dto/twoFactorAuthenticationEnable.dto';
import { AuthEntity } from './entity/auth.entity';

const constants = {
  appName: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME || 'Pong API',
  clientId: process.env.OAUTH_42_CLIENT_ID || 'You need to set this',
  clientSecret: process.env.OAUTH_42_CLIENT_SECRET || 'You need to set this',
  publicURL: process.env.NEST_PUBLIC_API_URL || 'http://localhost:3000/api',
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    if (user.oauthEnabled) {
      throw new UnauthorizedException(
        'This account is linked to an oauth provider',
      );
    }

    // This should not happen : password should be set for all users except oauth users
    if (!user.password) {
      throw new UnauthorizedException('Password is not set for this user');
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
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
      if (user.twoFactorEnabled) {
        throw new ConflictException('2FA secret is already enabled');
      }
      const secret = authenticator.generateSecret();
      const otpAuthUrl = authenticator.keyuri(
        user.email,
        constants.appName,
        secret,
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret },
      });
      return { secret, otpAuthUrl };
    });
  }

  async getAccessTokenWith42({
    code,
    redirect_uri,
  }: {
    code: string;
    redirect_uri;
  }) {
    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: constants.clientId,
      client_secret: constants.clientSecret,
      code: code,
      redirect_uri: constants.publicURL + redirect_uri,
    });

    return fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      body: form,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((res) => {
      if (res.status === 401) {
        throw new UnauthorizedException('Invalid 42 credentials');
      }
      if (!res.ok) {
        return Promise.reject(res.statusText);
      }
      {
        return res.json().then((data) => {
          return data.access_token;
        });
      }
    });
  }

  async getUserInfoWith42({ access_token }: { access_token: string }) {
    return fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).then((res) => {
      if (res.status === 401) {
        throw new UnauthorizedException('Invalid 42 credentials');
      }
      if (!res.ok) {
        return Promise.reject(res.statusText);
      }
      return res.json();
    });
  }

  signupWithOauth42(code: string): Promise<User> {
    return this.getAccessTokenWith42({
      code,
      redirect_uri: '/auth/signup/oauth2/42/callback',
    }).then(
      (access_token) =>
        this.getUserInfoWith42({ access_token }).then(
          ({ email, login, image }) =>
            email == undefined || login == undefined
              ? Promise.reject(new HttpException('Invalid user info', 400))
              : this.prisma.user.create({
                  data: {
                    email,
                    name: login,
                    avatarURL: image?.link,
                    oauthEnabled: true,
                  },
                }),
        ),
      // // TODO : random password? without password?
      // // TODO : save access_token in db
    );
  }

  async loginWithOauth42(code: string): Promise<AuthEntity> {
    return this.getAccessTokenWith42({
      code,
      redirect_uri: '/auth/login/oauth2/42/callback',
    }).then((access_token) => {
      return this.getUserInfoWith42({ access_token }).then(({ email }) => {
        if (!email) {
          throw new Error('Invalid user info');
        }
        return this.prisma.user
          .findUniqueOrThrow({
            where: { email },
          })
          .then((user) => {
            if (!user.oauthEnabled) {
              throw new HttpException(
                'This account is not linked to an oauth provider',
                400,
              );
            }
            return {
              accessToken: this.jwtService.sign({
                userId: user.id,
                isTwoFactorEnabled: user.twoFactorEnabled,
                isTwoFactorAuthenticated: false,
              }),
            };
          });
      });
    });
  }

  async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  enableTwoFactorAuthentication(
    dto: TwoFactorAuthenticationEnableDto,
    userId: number,
  ) {
    return this.prisma.$transaction(async (prisma) => {
      let user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      if (user.twoFactorEnabled) {
        throw new ConflictException('2FA secret is already enabled');
      }
      if (!user.twoFactorSecret) {
        throw new ConflictException(
          '2FA secret is not generated for this user',
        );
      }
      const isCodeValid = authenticator.verify({
        token: dto.code,
        secret: user.twoFactorSecret,
      });
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

  disableTwoFactorAuthentication(userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      let user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      if (!user.twoFactorEnabled) {
        throw new ConflictException('2FA secret is not enabled');
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: false,
        },
      });
      return {
        accessToken: this.jwtService.sign({
          userId: user.id,
          isTwoFactorEnabled: user.twoFactorEnabled,
          isTwoFactorAuthenticated: false,
        }),
      };
    });
  }

  async twoFactorAuthenticate(dto: TwoFactorAuthenticationDto, userId: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!user.twoFactorEnabled) {
      throw new ConflictException('2FA secret is not enabled');
    }
    if (!user.twoFactorSecret) {
      throw new ConflictException('2FA secret is not generated for this user');
    }
    const isCodeValid = authenticator.verify({
      token: dto.code,
      secret: user.twoFactorSecret,
    });
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
