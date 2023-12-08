import { CanActivate, ExecutionContext } from '@nestjs/common';
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
    return user?.id === Number(params.userId);
  }
}
