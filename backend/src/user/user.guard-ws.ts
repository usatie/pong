import { CanActivate, ExecutionContext } from '@nestjs/common';
// import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';

export class UserGuardWs implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();

    // This is cashing the user in the client object.
    // This means that the user could be outdated.
    if (client.user) return true;

    // TODO: there is a still overhead for non-authenticated users.
    // When handleConnection is called, the connection is already created.
    // This means that clients can send messages before `client.user` is set.
    // The code below makes sure that authorized users don't get unauthorized.
    const token = client.request.headers.cookie
      ?.split('; ')
      ?.find((c) => c.startsWith('token='))
      ?.split('=')[1];

    if (!token) return false;

    try {
      const user = await this.authService.verifyAccessToken(token);
      if (!user) return false;
      client.user = user;
    } catch {
      return false;
    }
    return true;
  }
}
