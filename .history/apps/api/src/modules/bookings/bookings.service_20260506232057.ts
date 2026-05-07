import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBookingDto } from './dto/booking.dto';
import { NotificationsService } from '../notifications/notifications.service';
import dayjs from 'dayjs';
import { Booking, BlockedSlot } from '@prisma/client';
@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        barber: true,
        service: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        barber: true,
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  async create(dto: CreateBookingDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const startTime = dayjs(dto.startTime);
    const endTime = startTime.add(service.durationMinutes, 'minute');
    const dayOfWeek = startTime.day();

    // 1. Check Working Hours
    const workingHours = await this.prisma.workingHours.findFirst({
      where: { dayOfWeek, isActive: true },
    });

    if (!workingHours) {
      throw new ConflictException('The barbershop is closed on this day');
    }

    const [startH, startM] = workingHours.startTime.split(':').map(Number);
    const [endH, endM] = workingHours.endTime.split(':').map(Number);
    const workStart = startTime.startOf('day').set('hour', startH).set('minute', startM);
    const workEnd = startTime.startOf('day').set('hour', endH).set('minute', endM);

    if (startTime.isBefore(workStart) || endTime.isAfter(workEnd)) {
      throw new ConflictException('Selected time is outside working hours');
    }

    // 2. Check Blocked Slots
    const blocked = await this.prisma.blockedSlot.findFirst({
      where: {
        OR: [
          {
            startTime: { lt: endTime.toDate() },
            endTime: { gt: startTime.toDate() },
          },
        ],
      },
    });

    if (blocked) {
      throw new ConflictException('This time slot is manually blocked');
    }

    // 3. Check overlapping bookings (Improved: Strict overlap and concurrency check)
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        barberId: dto.barberId,
        status: { in: ['reserved', 'completed'] },
        AND: [
          { startTime: { lt: endTime.toDate() } },
          { endTime: { gt: startTime.toDate() } }
        ]
      },
    });

    if (overlapping) {
      this.logger.warn(`Conflict detected for barber ${dto.barberId} at ${startTime.toISOString()}`);
      throw new ConflictException('Time slot is already booked');
    }

    try {
      const booking = await this.prisma.booking.create({
        data: {
          clientName: dto.clientName,
          clientPhone: dto.clientPhone,
          clientEmail: dto.clientEmail,
          startTime: startTime.toDate(),
          endTime: endTime.toDate(),
          barberId: dto.barberId,
          serviceId: dto.serviceId,
          notes: dto.notes,
        },
        include: {
          barber: true,
          service: true,
        },
      });

      // Send notification
      if (booking.clientEmail) {
        await this.notifications.sendBookingConfirmation(booking.clientEmail, {
          clientName: booking.clientName,
          barberName: booking.barber.name,
          serviceName: booking.service.name,
          date: dayjs(booking.startTime).format('DD/MM/YYYY'),
          time: dayjs(booking.startTime).format('HH:mm'),
        });
      }

      return booking;
    } catch (error: any) {
      this.logger.error('Error creating booking', error.stack);
      throw new ConflictException('Could not create booking. Please try again.');
    }
  }

  async getAvailability(barberId: string, date: string, serviceId?: string) {
    const selectedDate = dayjs(date);
    const dayOfWeek = selectedDate.day();
    const now = dayjs();

    // Fetch working hours for this day
    const workingHours = await this.prisma.workingHours.findFirst({
      where: { dayOfWeek, isActive: true },
    });

    if (!workingHours) {
      return []; // Not working this day
    }

    // Get service duration if provided, otherwise default to 30 mins
    let duration = 30;
    if (serviceId) {
      const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
      if (service) duration = service.durationMinutes;
    }

    const [startH, startM] = workingHours.startTime.split(':').map(Number);
    const [endH, endM] = workingHours.endTime.split(':').map(Number);

    const startOfDay = selectedDate.startOf('day').set('hour', startH).set('minute', startM);
    const endOfDay = selectedDate.startOf('day').set('hour', endH).set('minute', endM);
    
    // Fetch bookings (exclude cancelled)
    const bookings = await this.prisma.booking.findMany({
      where: {
        barberId,
        status: { in: ['reserved', 'completed'] },
        startTime: {
          gte: selectedDate.startOf('day').toDate(),
          lt: selectedDate.endOf('day').toDate(),
        },
      },
    });

    // Fetch blocked slots
    const blockedSlots = await this.prisma.blockedSlot.findMany({
      where: {
        startTime: {
          lt: selectedDate.endOf('day').toDate(),
        },
        endTime: {
          gt: selectedDate.startOf('day').toDate(),
        },
      },
    });

    const slots = [];
    let current = startOfDay;

    // Use 15 or 30 minute intervals for slot starts
    const interval = 30; 

    while (current.isBefore(endOfDay)) {
      const slotEnd = current.add(duration, 'minute');
      
      // Don't show slots in the past
      if (current.isBefore(now)) {
        current = current.add(interval, 'minute');
        continue;
      }

      // Check if slot fits within working hours
      if (slotEnd.isAfter(endOfDay)) {
        break;
      }

      const isBooked = bookings.some((b) => {
        const bStart = dayjs(b.startTime);
        const bEnd = dayjs(b.endTime);
        return current.isBefore(bEnd) && slotEnd.isAfter(bStart);
      });

      const isBlocked = blockedSlots.some((b: BlockedSlot) => {
        const bStart = dayjs(b.startTime);
        const bEnd = dayjs(b.endTime);
        return current.isBefore(bEnd) && slotEnd.isAfter(bStart);
      });

      slots.push({
        time: current.format('HH:mm'),
        available: !isBooked && !isBlocked,
      });

      current = current.add(interval, 'minute');
    }

    return slots;
  }


  async update(id: string, data: any) {

    const booking = await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data,
      include: {
        barber: true,
        service: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}

