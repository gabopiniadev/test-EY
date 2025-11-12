import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ParseOptionalDatePipe } from '../../common/pipes/parse-optional-date.pipe';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('leads/stats')
  async getLeadsStats(
    @Query('startDate', new ParseOptionalDatePipe()) startDate?: Date,
    @Query('endDate', new ParseOptionalDatePipe()) endDate?: Date,
  ) {
    return this.analyticsService.getLeadsStats(startDate, endDate);
  }

  @Get('deals/analysis')
  async getDealsAnalysis(
    @Query('startDate', new ParseOptionalDatePipe()) startDate?: Date,
    @Query('endDate', new ParseOptionalDatePipe()) endDate?: Date,
  ) {
    return this.analyticsService.getDealsAnalysis(startDate, endDate);
  }
}
