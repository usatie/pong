import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export const CurrentRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Role => {
    data; // To remove the unused variable warning
    const req = ctx.switchToHttp().getRequest();
    return req.role;
  },
);
