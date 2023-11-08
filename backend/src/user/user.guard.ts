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
	// https://docs.nestjs.com/recipes/passport
	// Passport automatically creates a user object, based on the value we return from the validate() method, and assigns it to the Request object as req.user.
	const { params, user } = req;

    if (params?.id == null) {
      return true; // this request isn't scoped to a single existing todo
    }

	// user.id is a number, params.id is a string
	return user.id === Number(params.id);
  }
}
