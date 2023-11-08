import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class UserGuard implements CanActivate {
	constructor(private readonly userService: UserService) {}

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
