import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthService } from 'src/auth/auth.service';

// This adapter can be used to authenticate socket.io connections
// Not using this for now because we want to provide some events for non-authenticated users
// For implementation: https://github.com/nestjs/nest/issues/882#issuecomment-632698668
export class AuthenticationIoAdapter extends IoAdapter {
  private readonly authService: AuthService;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
  }
  createIOServer(port: number, options?: any): any {
    options.allowRequest = async (request, allowFunction) => {
      const token = request.headers.cookie
        ?.split('; ')
        ?.find((c) => c.startsWith('token='))
        ?.split('=')[1];

      try {
        await this.authService.verifyAccessToken(token);
        return allowFunction(null, true);
      } catch (error) {
        return allowFunction('Unauthorized', false);
      }
    };
    return super.createIOServer(port, options);
  }
}
