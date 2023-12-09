import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class UserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const { params, user } = req;
    // This guard is for requests to /user/:userId
    if (!params?.userId) {
      throw new Error('UserGuard should only be used on routes with a userId');
    }
    if (typeof params.userId !== 'string' || !/^\d+$/.test(params.userId)) {
      throw new BadRequestException('userId parameter must be a valid integer');
    }
    return user?.id === parseInt(params.userId, 10);
  }
}
