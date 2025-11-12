import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueService } from '../common/queue/queue.service';
import { ConfigService } from '@nestjs/config';
import { EtlService } from './etl.service';

@Injectable()
export class EtlConsumerService implements OnModuleInit {
  private readonly logger = new Logger(EtlConsumerService.name);

  constructor(
    private queueService: QueueService,
    private configService: ConfigService,
    private etlService: EtlService,
  ) {}

  async onModuleInit() {
    const queue = this.configService.get('rabbitmq.queue');

    this.logger.log('Starting ETL consumer...');

    await this.queueService.consumeMessages(queue, async (message) => {
      await this.processEtlMessage(message);
    });
  }

  private async processEtlMessage(message: any) {
    this.logger.log(`Processing ETL message: ${JSON.stringify(message)}`);

    try {
      const { type } = message;

      switch (type) {
        case 'leads':
          await this.etlService.runLeadsEtl();
          this.logger.log('Leads ETL completed successfully');
          break;

        case 'deals':
          await this.etlService.runDealsEtl();
          this.logger.log('Deals ETL completed successfully');
          break;

        case 'full':
          await this.etlService.runFullEtl();
          this.logger.log('Full ETL completed successfully');
          break;

        default:
          this.logger.warn(`Unknown ETL type: ${type}`);
      }
    } catch (error) {
      this.logger.error('Error processing ETL message', error);
      throw error;
    }
  }
}
