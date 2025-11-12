import { Module } from '@nestjs/common';
import { EtlService } from './etl.service';
import { EtlConsumerService } from './etl-consumer.service';
import { ExtractModule } from './extract/extract.module';
import { TransformModule } from './transform/transform.module';
import { LoadModule } from './load/load.module';

@Module({
  imports: [ExtractModule, TransformModule, LoadModule],
  providers: [EtlService, EtlConsumerService],
  exports: [EtlService],
})
export class EtlModule {}
