import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoadService } from './load.service';
import { Lead } from '../../database/entities/lead.entity';
import { Deal } from '../../database/entities/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Deal])],
  providers: [LoadService],
  exports: [LoadService],
})
export class LoadModule {}
