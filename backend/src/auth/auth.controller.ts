import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { TwoFactorAuthenticationDto } from './dto/twoFactorAuthentication.dto';
import { TwoFactorAuthenticationEnableDto } from './dto/twoFactorAuthenticationEnable.dto';
import { AuthEntity } from './entity/auth.entity';
import { JwtGuardWithout2FA } from './jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  constants = {
    loginUrl: ((): string => {
      const clientId = process.env.OAUTH_42_CLIENT_ID;
      const codeEndpointUrl = 'https://api.intra.42.fr/oauth/authorize';
      const redirectUri =
        process.env.NEST_PUBLIC_API_URL + '/auth/login/oauth2/42/callback';
      return `${codeEndpointUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    })(),
    signupUrl: ((): string => {
      const clientId = process.env.OAUTH_42_CLIENT_ID;
      const codeEndpointUrl = 'https://api.intra.42.fr/oauth/authorize';
      const redirectUri =
        process.env.NEST_PUBLIC_API_URL + '/auth/signup/oauth2/42/callback';
      return `${codeEndpointUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    })(),
  };

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto): Promise<AuthEntity> {
    return this.authService.login(email, password);
  }

  @Get('signup/oauth2/42')
  @ApiOkResponse({ type: AuthEntity })
  @Redirect()
  redirectToOauth42() {
    // TODO : implement state system for enhanced security
    return { url: this.constants.signupUrl };
  }

  @Get('signup/oauth2/42/callback')
  @ApiOkResponse({ type: AuthEntity })
  @Redirect('/login')
  async signupWithOauth42(@Query('code') code: string) {
    return this.authService.signupWithOauth42(code);
  }

  @Get('login/oauth2/42')
  @ApiOkResponse({ type: AuthEntity })
  @Redirect()
  redirectToOauth42ToLogin() {
    // TODO : implement state system for enhanced security
    return { url: this.constants.loginUrl };
  }

  @Get('login/oauth2/42/callback')
  @ApiOkResponse({ type: AuthEntity })
  loginWithOauth42(@Query('code') code: string, @Res() res: Response) {
    return this.authService.loginWithOauth42(code).then((auth) => {
      res.cookie('token', auth.accessToken);
      res.redirect('/');
    });
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
