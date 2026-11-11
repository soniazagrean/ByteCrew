import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { GpaModule } from './gpa/gpa.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { EventsModule } from './events/events.module';
import { DiscountsModule } from './discounts/discounts.module';
import { AssistantModule } from './assistant/assistant.module';
import { ReelsModule } from './reels/reels.module';
import { BudgetModule } from './budget/budget.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    DocumentsModule,
    GpaModule,
    AnnouncementsModule,
    EventsModule,
    DiscountsModule,
    AssistantModule,
    ReelsModule,
    BudgetModule,
    NotificationsModule,
    SettingsModule,
    AdminModule,
    StorageModule,
  ],
})
export class AppModule {}
