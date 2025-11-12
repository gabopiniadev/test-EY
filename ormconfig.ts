import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'hubspot_dw',
  entities: ['src/database/entities/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  migrationsTableName: 'migrations',
});
