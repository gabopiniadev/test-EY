import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: RedisClientType;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = this.configService.get('redis');

    this.client = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connecting...');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis Client Ready');
      this.isConnected = true;
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}`, error);
      return false;
    }
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      const count = await this.client.incr(key);
      if (ttlSeconds && count === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}`, error);
      return 0;
    }
  }

  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const count = await this.increment(key, windowSeconds);
    const remaining = Math.max(0, limit - count);

    return {
      allowed: count <= limit,
      remaining,
    };
  }
}
