import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto } from './dto/availability.dto';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { PublicTenantSlug } from '../../common/decorators/public-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@barberos/types';
import { TenantsService } from '../tenants/tenants.service';

@Controller('barbers/:barberId/availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly tenantsService: TenantsService,
  ) {}

  // ── Public Endpoint ────────────────────────────────────────────────────────
  @Get('slots')
  async getSlots(
    @Param('barberId', ParseUUIDPipe) barberId: string,
    @Query('date') date: string,
    @PublicTenantSlug() slug: string,
  ) {
    const tenant = await this.tenantsService.findBySlug(slug);
    return this.availabilityService.getSlots(tenant.id, barberId, date);
  }

  // ── Protected Endpoints ───────────────────────────────────────────────────
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getSchedule(
    @TenantId() tenantId: string,
    @Param('barberId', ParseUUIDPipe) barberId: string,
  ) {
    return this.availabilityService.getSchedule(tenantId, barberId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BARBER)
  setAvailability(
    @TenantId() tenantId: string,
    @Param('barberId', ParseUUIDPipe) barberId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.availabilityService.setAvailability(tenantId, barberId, dto);
  }
}
