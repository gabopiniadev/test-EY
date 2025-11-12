import { Injectable, Logger } from '@nestjs/common';
import { HubSpotExtractService } from './extract/hubspot-extract.service';
import { TransformService } from './transform/transform.service';
import { LoadService } from './load/load.service';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private extractService: HubSpotExtractService,
    private transformService: TransformService,
    private loadService: LoadService,
  ) {}

  async runLeadsEtl(): Promise<{ created: number; updated: number; total: number }> {
    this.logger.log('Starting Leads ETL process...');
    const startTime = Date.now();

    try {
      this.logger.log('Step 1: Extracting leads from HubSpot...');
      const hubspotLeads = await this.extractService.extractAllLeads();
      this.logger.log(`Extracted ${hubspotLeads.length} leads from HubSpot`);

      if (hubspotLeads.length === 0) {
        this.logger.warn('No leads found to process');
        return { created: 0, updated: 0, total: 0 };
      }

      this.logger.log('Step 2: Transforming leads data...');
      const transformedLeads = this.transformService.transformLeads(hubspotLeads);
      this.logger.log(`Transformed ${transformedLeads.length} leads`);

      this.logger.log('Step 3: Loading leads to database...');
      const result = await this.loadService.loadLeadsBatch(transformedLeads);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `Leads ETL completed in ${duration}s. Created: ${result.created}, Updated: ${result.updated}`,
      );

      return {
        ...result,
        total: hubspotLeads.length,
      };
    } catch (error) {
      this.logger.error('Error in Leads ETL process', error);
      throw error;
    }
  }

  async runDealsEtl(): Promise<{ created: number; updated: number; total: number }> {
    this.logger.log('Starting Deals ETL process...');
    const startTime = Date.now();

    try {
      this.logger.log('Step 1: Extracting deals from HubSpot...');
      const hubspotDeals = await this.extractService.extractAllDeals();
      this.logger.log(`Extracted ${hubspotDeals.length} deals from HubSpot`);

      if (hubspotDeals.length === 0) {
        this.logger.warn('No deals found to process');
        return { created: 0, updated: 0, total: 0 };
      }

      this.logger.log('Step 2: Transforming deals data...');
      const transformedDeals = this.transformService.transformDeals(hubspotDeals);
      this.logger.log(`Transformed ${transformedDeals.length} deals`);

      this.logger.log('Step 3: Loading deals to database...');
      const result = await this.loadService.loadDealsBatch(transformedDeals);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `Deals ETL completed in ${duration}s. Created: ${result.created}, Updated: ${result.updated}`,
      );

      return {
        ...result,
        total: hubspotDeals.length,
      };
    } catch (error) {
      this.logger.error('Error in Deals ETL process', error);
      throw error;
    }
  }

  async runFullEtl(): Promise<{
    leads: { created: number; updated: number; total: number };
    deals: { created: number; updated: number; total: number };
  }> {
    this.logger.log('Starting Full ETL process (Leads + Deals)...');
    const startTime = Date.now();

    try {
      const [leadsResult, dealsResult] = await Promise.all([
        this.runLeadsEtl(),
        this.runDealsEtl(),
      ]);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`Full ETL completed in ${duration}s`);

      return {
        leads: leadsResult,
        deals: dealsResult,
      };
    } catch (error) {
      this.logger.error('Error in Full ETL process', error);
      throw error;
    }
  }
}
