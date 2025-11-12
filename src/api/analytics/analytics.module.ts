import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Lead } from '../../database/entities/lead.entity';
import { Deal } from '../../database/entities/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Deal])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
