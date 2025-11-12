import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module';
import { CacheModule } from './common/cache/cache.module';
import { QueueModule } from './common/queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { EtlModule } from './etl/etl.module';
import { AnalyticsModule } from './api/analytics/analytics.module';
import { EtlApiModule } from './api/etl/etl.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    QueueModule,
    DatabaseModule,
    EtlModule,
    AnalyticsModule,
    EtlApiModule,
  ],
})
export class AppModule {}
