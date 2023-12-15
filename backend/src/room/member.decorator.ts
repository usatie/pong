import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserOnRoom } from '@prisma/client';

export const Member = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserOnRoom => {
    data; // To remove the unused variable warning
    const req = ctx.switchToHttp().getRequest();
    return req.member;
  },
);
