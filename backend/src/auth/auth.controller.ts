import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { OauthDto } from './dto/oauth.dto';
import { TwoFactorAuthenticationDto } from './dto/twoFactorAuthentication.dto';
import { TwoFactorAuthenticationEnableDto } from './dto/twoFactorAuthenticationEnable.dto';
import { AuthEntity } from './entity/auth.entity';
import { JwtGuardWithout2FA } from './jwt-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto): Promise<AuthEntity> {
    return this.authService.login(email, password);
  }

  @Post('oauth2/signup/42')
  @ApiCreatedResponse({ type: AuthEntity })
  async signupWith42(@Body() dto: OauthDto) {
    return this.authService.signupWith42(dto);
  }

  @Post('2fa/generate')
  @UseGuards(JwtGuardWithout2FA)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  async generate2FASecret(@CurrentUser() user: User) {
    const { secret, otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(user.id);
    return {
      secret,
      otpAuthUrl,
    };
  }

  @Post('2fa/enable')
  @HttpCode(200)
  @UseGuards(JwtGuardWithout2FA)
  @ApiBearerAuth()
  @ApiOkResponse()
  async enable2FA(
    @Body() dto: TwoFactorAuthenticationEnableDto,
    @CurrentUser() user: User,
  ) {
    return this.authService.enableTwoFactorAuthentication(dto, user.id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtGuardWithout2FA)
  @ApiBearerAuth()
  @ApiOkResponse()
  async twoFactorAuthenticate(
    @Body() dto: TwoFactorAuthenticationDto,
    @CurrentUser() user: User,
  ) {
    return this.authService.twoFactorAuthenticate(dto, user.id);
  }
}
