import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    data; // To remove the unused variable warning
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
