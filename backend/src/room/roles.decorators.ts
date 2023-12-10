import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

export const roleNeed = Reflector.createDecorator<Role>();
