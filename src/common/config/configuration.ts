export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY,
    baseUrl: process.env.HUBSPOT_BASE_URL || 'https://api.hubapi.com',
  },

  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'hubspot_dw',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queue: process.env.RABBITMQ_QUEUE_ETL || 'etl_queue',
    exchange: process.env.RABBITMQ_EXCHANGE_ETL || 'etl_exchange',
  },

  etl: {
    batchSize: parseInt(process.env.ETL_BATCH_SIZE, 10) || 100,
    maxRetries: parseInt(process.env.ETL_MAX_RETRIES, 10) || 3,
    retryDelay: parseInt(process.env.ETL_RETRY_DELAY, 10) || 5000,
  },
});
