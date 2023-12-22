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
import { jwtConstants } from './auth.module';
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
    const payload = this.jwtService.verify(accessToken, {
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
      const user = await prisma.user.findUnique({ where: { id: userId } });
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
      return this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });
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
        isTwoFactorAuthenticated: true,
      }),
    };
  }
}
