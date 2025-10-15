import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EscrowController } from './controllers/escrow.controller';
import { DisputeController } from './controllers/dispute.controller';
import { NotificationController } from './controllers/notification.controller';
import { EscrowService } from './services/escrow.service';
import { DisputeService } from './services/dispute.service';
import { NotificationService } from './services/notification.service';
import { BlockFrostService } from './services/blockfrost.service';
import appConfig from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduled tasks for monitoring
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
  controllers: [
    AppController,
    EscrowController,
    DisputeController,
    NotificationController
  ],
  providers: [
    AppService,
    EscrowService,
    DisputeService,
    NotificationService,
    BlockFrostService
  ],
})
export class AppModule { }
