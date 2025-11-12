import { Module } from '@nestjs/common';
import { HubSpotExtractService } from './hubspot-extract.service';

@Module({
  providers: [HubSpotExtractService],
  exports: [HubSpotExtractService],
})
export class ExtractModule {}
