import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export interface UserPayload {
  id: number;
  email: string;
  name: string | null;
}

type RequestWithUser = Request & { user?: unknown };

function isUserPayload(value: unknown): value is UserPayload {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'number' &&
    typeof record.email === 'string' &&
    (typeof record.name === 'string' || record.name === null)
  );
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!isUserPayload(user)) {
      throw new UnauthorizedException('User tidak ditemukan');
    }
    return user;
  },
);
