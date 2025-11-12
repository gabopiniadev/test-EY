import { Module } from '@nestjs/common';
import { EtlController } from './etl.controller';
import { EtlModule as EtlServiceModule } from '../../etl/etl.module';

@Module({
  imports: [EtlServiceModule],
  controllers: [EtlController],
})
export class EtlApiModule {}
