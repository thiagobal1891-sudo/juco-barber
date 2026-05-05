import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// ── @CurrentUser() ──────────────────────────────────────────────────────────
// Extracts the authenticated user from the JWT payload
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// ── @TenantId() ─────────────────────────────────────────────────────────────
// Extracts tenantId from the authenticated user
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId;
  },
);
