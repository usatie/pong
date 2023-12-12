import {
  Body,
  Controller,
  Header,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '@prisma/client';

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
  @Header('Content-Type', 'image/png')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async register(@Res() response: Response, @Req() request: { user: User }) {
    const { otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        request.user,
      );
    return this.authService.pipeQrCodeStream(response, otpAuthUrl);
  }
}
