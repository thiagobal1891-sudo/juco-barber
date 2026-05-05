import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { BarbersModule } from './modules/barbers/barbers.module';
import { ServicesModule } from './modules/services/services.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import sendgridConfig from './config/sendgrid.config';
import paymentConfig from './config/payment.config';

@Module({
  imports: [
    // ── Configuration ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, redisConfig, sendgridConfig, paymentConfig],
      cache: true,
    }),

    // ── Rate limiting ───────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: Number(process.env.THROTTLE_TTL ?? 60000),
            limit: Number(process.env.THROTTLE_LIMIT ?? 100),
          },
        ],
      }),
    }),

    // ── Events ─────────────────────────────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: true,
      maxListeners: 20,
    }),

    // ── Cron jobs ───────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Infrastructure ──────────────────────────────────────────────────────
    PrismaModule,
    RedisModule,

    // ── Feature modules ─────────────────────────────────────────────────────
    AuthModule,
    TenantsModule,
    BarbersModule,
    ServicesModule,
    AvailabilityModule,
    AppointmentsModule,
    ClientsModule,
    PaymentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
