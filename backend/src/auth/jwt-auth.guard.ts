import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtGuardWithout2FA extends AuthGuard('jwt-without-2fa') {}

@Injectable()
export class WsJwtAuthGuard extends AuthGuard('ws-jwt') {}
