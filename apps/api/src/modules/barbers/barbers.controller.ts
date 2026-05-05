import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BarbersService } from './barbers.service';
import { CreateBarberDto, UpdateBarberDto } from './dto/barber.dto';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@barberos/types';

@Controller('barbers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.barbersService.findAll(tenantId);
  }

  @Get(':id')
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.barbersService.findOne(tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@TenantId() tenantId: string, @Body() dto: CreateBarberDto) {
    return this.barbersService.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBarberDto,
  ) {
    return this.barbersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.barbersService.remove(tenantId, id);
  }
}
