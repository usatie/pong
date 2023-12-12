import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '@prisma/client';
import { TwoFactorAuthenticationEnableDto } from './dto/twoFactorAuthenticationEnable.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto): Promise<AuthEntity> {
    return this.authService.login(email, password);
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  async register(@Req() request: { user: User }) {
    const { secret, otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );
    return {
      secret,
      otpAuthUrl,
    };
  }

  @Post('2fa/enable')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async enable2FA(
    @Body() dto: TwoFactorAuthenticationEnableDto,
    @Req() request: { user: User },
  ) {
    return this.authService.enableTwoFactorAuthentication(dto, request.user);
  }
}
