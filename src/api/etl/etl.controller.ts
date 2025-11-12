import { Controller, Post, Get, Body } from '@nestjs/common';
import { EtlService } from '../../etl/etl.service';
import { QueueService } from '../../common/queue/queue.service';
import { ConfigService } from '@nestjs/config';

@Controller('etl')
export class EtlController {
  constructor(
    private readonly etlService: EtlService,
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  @Post('leads')
  async runLeadsEtl(@Body() body: { async?: boolean }) {
    if (body?.async) {
      await this.queueService.publishMessage('etl', {
        type: 'leads',
        timestamp: new Date().toISOString(),
      });
      return {
        message: 'Leads ETL job queued for processing',
        status: 'queued',
      };
    }

    const result = await this.etlService.runLeadsEtl();
    return {
      message: 'Leads ETL completed successfully',
      ...result,
    };
  }

  @Post('deals')
  async runDealsEtl(@Body() body: { async?: boolean }) {
    if (body?.async) {
      await this.queueService.publishMessage('etl', {
        type: 'deals',
        timestamp: new Date().toISOString(),
      });
      return {
        message: 'Deals ETL job queued for processing',
        status: 'queued',
      };
    }

    const result = await this.etlService.runDealsEtl();
    return {
      message: 'Deals ETL completed successfully',
      ...result,
    };
  }

  @Post('full')
  async runFullEtl(@Body() body: { async?: boolean }) {
    if (body?.async) {
      await this.queueService.publishMessage('etl', {
        type: 'full',
        timestamp: new Date().toISOString(),
      });
      return {
        message: 'Full ETL job queued for processing',
        status: 'queued',
      };
    }

    const result = await this.etlService.runFullEtl();
    return {
      message: 'Full ETL completed successfully',
      ...result,
    };
  }
}
