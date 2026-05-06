import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BookingsModule } from '../bookings/bookings.module';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';


@Module({
  imports: [PrismaModule, BookingsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
