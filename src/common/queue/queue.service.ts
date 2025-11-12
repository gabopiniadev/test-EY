import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { connect } from 'amqp-connection-manager';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private connection: any;
  private channel: amqp.Channel;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const rabbitmqConfig = this.configService.get('rabbitmq');

    try {
      this.connection = connect([rabbitmqConfig.url]);

      this.connection.on('connect', () => {
        this.logger.log('RabbitMQ Connected');
        this.isConnected = true;
      });

      this.connection.on('disconnect', (params: any) => {
        this.logger.warn('RabbitMQ Disconnected', params.err);
        this.isConnected = false;
      });

      const channelWrapper = this.connection.createChannel({
        setup: async (channel: amqp.Channel) => {
          const exchange = this.configService.get('rabbitmq.exchange');
          const queue = this.configService.get('rabbitmq.queue');

          await channel.assertExchange(exchange, 'direct', { durable: true });
          await channel.assertQueue(queue, { durable: true });
          await channel.bindQueue(queue, exchange, 'etl');

          this.channel = channel;
          this.logger.log('RabbitMQ Channel Ready');
        },
      });

      await channelWrapper.waitForConnect();
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close();
      this.isConnected = false;
    }
  }

  async publishMessage(routingKey: string, message: any): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      this.logger.warn('RabbitMQ not connected, message not sent');
      return false;
    }

    try {
      const exchange = this.configService.get('rabbitmq.exchange');
      const buffer = Buffer.from(JSON.stringify(message));

      await this.channel.publish(exchange, routingKey, buffer, {
        persistent: true,
      });

      return true;
    } catch (error) {
      this.logger.error('Error publishing message', error);
      return false;
    }
  }

  async consumeMessages(queue: string, onMessage: (msg: any) => Promise<void>): Promise<void> {
    if (!this.isConnected || !this.channel) {
      this.logger.warn('RabbitMQ not connected, cannot consume');
      return;
    }

    try {
      await this.channel.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await onMessage(content);
          this.channel.ack(msg);
        } catch (error) {
          this.logger.error('Error processing message', error);
          this.channel.nack(msg, false, false);
        }
      });

      this.logger.log(`Started consuming from queue: ${queue}`);
    } catch (error) {
      this.logger.error('Error setting up consumer', error);
    }
  }
}
