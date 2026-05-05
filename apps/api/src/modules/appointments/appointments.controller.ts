import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/appointment.dto';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { PublicTenantSlug } from '../../common/decorators/public-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@barberos/types';
import { TenantsService } from '../tenants/tenants.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly tenantsService: TenantsService,
  ) {}

  // ── Public Endpoint (for booking widget) ──────────────────────────────────
  @Post()
  async create(
    @PublicTenantSlug() slug: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    const tenant = await this.tenantsService.findBySlug(slug);
    return this.appointmentsService.create(tenant.id, dto);
  }

  // ── Protected Endpoints (for admin/barber dashboard) ──────────────────────
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@TenantId() tenantId: string) {
    return this.appointmentsService.findAll(tenantId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOne(tenantId, id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  cancel(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.cancel(tenantId, id);
  }

  @Patch(':id/complete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BARBER)
  complete(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.complete(tenantId, id);
  }
}
