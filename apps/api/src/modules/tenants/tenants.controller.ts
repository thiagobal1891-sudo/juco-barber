import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantsService } from './tenants.service';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@barberos/types';

@Controller('barbershops')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@TenantId() tenantId: string) {
    return this.tenantsService.getMe(tenantId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  updateMe(@TenantId() tenantId: string, @Body() data: any) {
    return this.tenantsService.update(tenantId, data);
  }
}
