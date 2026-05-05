import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CreateBarberDto, UpdateBarberDto } from './dto/barber.dto';

@Injectable()
export class BarbersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.barber.findMany({
      where: { tenantId, isActive: true },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        services: {
          include: { service: true },
        },
      },
      orderBy: { displayName: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const barber = await this.prisma.barber.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        services: { include: { service: true } },
        availability: true,
      },
    });

    if (!barber) {
      throw new NotFoundException(`Barber ${id} not found`);
    }

    return barber;
  }

  async create(tenantId: string, dto: CreateBarberDto) {
    // Verify user belongs to tenant
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, tenantId },
    });
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found in this tenant`);
    }

    // Verify no barber profile exists for user
    const existing = await this.prisma.barber.findUnique({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User already has a barber profile');
    }

    const barber = await this.prisma.barber.create({
      data: {
        tenantId,
        userId: dto.userId,
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        ...(dto.serviceIds && {
          services: {
            create: dto.serviceIds.map((serviceId) => ({ serviceId })),
          },
        }),
      },
      include: {
        services: { include: { service: true } },
      },
    });

    return barber;
  }

  async update(tenantId: string, id: string, dto: UpdateBarberDto) {
    await this.findOne(tenantId, id); // verify exists

    return this.prisma.$transaction(async (tx) => {
      if (dto.serviceIds !== undefined) {
        // Replace all service associations
        await tx.barberService.deleteMany({ where: { barberId: id } });
        if (dto.serviceIds.length > 0) {
          await tx.barberService.createMany({
            data: dto.serviceIds.map((serviceId) => ({ barberId: id, serviceId })),
          });
        }
      }

      return tx.barber.update({
        where: { id },
        data: {
          displayName: dto.displayName,
          bio: dto.bio,
          avatarUrl: dto.avatarUrl,
          isActive: dto.isActive,
        },
        include: {
          services: { include: { service: true } },
          availability: true,
        },
      });
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.barber.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
