import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { BookingsService } from '../bookings/bookings.service';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BlockSlotDto } from './dto/block-slot.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Get('appointments')
  findAllAppointments() {
    return this.adminService.getAllBookings();
  }

  @Patch('appointments/:id')
  updateAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, dto);
  }

  @Delete('appointments/:id')
  cancelAppointment(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.remove(id);
  }

  @Post('block-time')
  blockTime(@Body() dto: BlockSlotDto) {
    return this.adminService.blockSlot(dto);
  }

  @Get('blocked-slots')
  getBlockedSlots() {
    return this.adminService.getBlockedSlots();
  }

  @Get('working-hours')
  getWorkingHours() {
    return this.adminService.getWorkingHours();
  }

  @Patch('working-hours/:id')
  updateWorkingHours(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.adminService.updateWorkingHours(id, data);
  }
}

