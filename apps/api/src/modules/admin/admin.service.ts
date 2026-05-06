import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { BlockSlotDto } from './dto/block-slot.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        barber: true,
        service: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async blockSlot(dto: BlockSlotDto) {
    return this.prisma.blockedSlot.create({
      data: {
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        reason: dto.reason,
      },
    });
  }

  async getBlockedSlots() {
    return this.prisma.blockedSlot.findMany({
      orderBy: { startTime: 'desc' },
    });
  }

  async getWorkingHours() {
    return this.prisma.workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateWorkingHours(id: string, data: any) {
    return this.prisma.workingHours.update({
      where: { id },
      data,
    });
  }
}
