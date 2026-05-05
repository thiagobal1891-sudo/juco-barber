import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AppointmentListener } from './listeners/appointment.listener';

@Module({
  providers: [NotificationsService, AppointmentListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
