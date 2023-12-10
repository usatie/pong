import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RoomRolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | boolean | Observable<boolean> {
    console.log('needRole : ');
    const request = context.switchToHttp().getRequest();
    return true;
  }
}
