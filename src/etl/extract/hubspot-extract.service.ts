import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class HubSpotExtractService {
  private readonly logger = new Logger(HubSpotExtractService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly hubspotConfig: any;
  private readonly rateLimitPerSecond = 100;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.hubspotConfig = this.configService.get('hubspot');

    this.axiosInstance = axios.create({
      baseURL: this.hubspotConfig.baseUrl,
      headers: {
        Authorization: `Bearer ${this.hubspotConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(async (config) => {
      const rateLimitKey = 'hubspot:ratelimit';
      const rateLimit = await this.cacheService.checkRateLimit(
        rateLimitKey,
        this.rateLimitPerSecond,
        1,
      );

      if (!rateLimit.allowed) {
        this.logger.warn(`Rate limit reached. Remaining: ${rateLimit.remaining}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return config;
    });
  }

  async extractLeads(
    after?: string,
    limit = 100,
  ): Promise<{
    results: any[];
    paging?: { next?: { after: string } };
  }> {
    try {
      const params: any = {
        limit,
        properties: [
          'email',
          'firstname',
          'lastname',
          'company',
          'phone',
          'lifecyclestage',
          'hs_lead_status',
          'createdate',
          'lastmodifieddate',
        ],
      };

      if (after) {
        params.after = after;
      }

      const response = await this.axiosInstance.get('/crm/v3/objects/contacts', {
        params,
      });

      return {
        results: response.data.results || [],
        paging: response.data.paging,
      };
    } catch (error) {
      this.logger.error(
        'Error extracting leads from HubSpot',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async extractAllLeads(): Promise<any[]> {
    const allLeads: any[] = [];
    let after: string | undefined;
    let hasMore = true;

    this.logger.log('Starting extraction of all leads...');

    while (hasMore) {
      const response = await this.extractLeads(after);
      allLeads.push(...response.results);

      this.logger.log(`Extracted ${allLeads.length} leads so far...`);

      if (response.paging?.next?.after) {
        after = response.paging.next.after;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        hasMore = false;
      }
    }

    this.logger.log(`Completed extraction of ${allLeads.length} leads`);
    return allLeads;
  }

  async extractDeals(
    after?: string,
    limit = 100,
  ): Promise<{
    results: any[];
    paging?: { next?: { after: string } };
  }> {
    try {
      const params: any = {
        limit,
        properties: [
          'dealname',
          'amount',
          'dealcurrencycode',
          'pipeline',
          'dealstage',
          'dealtype',
          'associatedcompany',
          'associatedcontacts',
          'closedate',
          'createdate',
          'hs_lastmodifieddate',
        ],
      };

      if (after) {
        params.after = after;
      }

      const response = await this.axiosInstance.get('/crm/v3/objects/deals', {
        params,
      });

      return {
        results: response.data.results || [],
        paging: response.data.paging,
      };
    } catch (error) {
      this.logger.error(
        'Error extracting deals from HubSpot',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async extractAllDeals(): Promise<any[]> {
    const allDeals: any[] = [];
    let after: string | undefined;
    let hasMore = true;

    this.logger.log('Starting extraction of all deals...');

    while (hasMore) {
      const response = await this.extractDeals(after);
      allDeals.push(...response.results);

      this.logger.log(`Extracted ${allDeals.length} deals so far...`);

      if (response.paging?.next?.after) {
        after = response.paging.next.after;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        hasMore = false;
      }
    }

    this.logger.log(`Completed extraction of ${allDeals.length} deals`);
    return allDeals;
  }
}
