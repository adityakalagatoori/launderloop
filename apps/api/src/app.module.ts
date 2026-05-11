import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TripsModule } from './trips/trips.module';
import { GuidesModule } from './guides/guides.module';
import { CitiesModule } from './cities/cities.module';
import { ActivitiesModule } from './activities/activities.module';
import { BookingsModule } from './bookings/bookings.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_MAX', 100),
        },
      ],
    }),

    // Core
    PrismaModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TripsModule,
    GuidesModule,
    CitiesModule,
    ActivitiesModule,
    BookingsModule,
    ExpensesModule,
    NotificationsModule,
    MessagesModule,

    // Admin (SUPER_ADMIN only)
    AdminModule,
  ],
})
export class AppModule {}