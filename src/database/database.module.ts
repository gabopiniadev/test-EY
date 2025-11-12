import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [Lead, Deal],
          synchronize: false,
          logging: configService.get('nodeEnv') === 'development',
          ssl:
            configService.get('nodeEnv') === 'production' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    TypeOrmModule.forFeature([Lead, Deal]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
