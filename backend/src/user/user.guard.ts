import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class UserGuard implements CanActivate {

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
	const req = context.switchToHttp().getRequest();
	const { params, user } = req;
	if (params?.id == null) {
		return true;
	}
	return user.id === Number(params.id);
  }
}
