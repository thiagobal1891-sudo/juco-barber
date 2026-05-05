import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const PublicTenantSlug = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const slug = request.headers['x-tenant-slug'];
    if (!slug) {
      throw new BadRequestException('x-tenant-slug header is required for public endpoints');
    }
    return slug;
  },
);
