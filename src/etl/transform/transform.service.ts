import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '../../database/entities/lead.entity';
import { Deal } from '../../database/entities/deal.entity';

@Injectable()
export class TransformService {
  private readonly logger = new Logger(TransformService.name);

  transformLead(hubspotData: any): Partial<Lead> {
    try {
      const properties = hubspotData.properties || {};

      return {
        hubspotId: hubspotData.id,
        email: properties.email || null,
        firstName: properties.firstname || null,
        lastName: properties.lastname || null,
        company: properties.company || null,
        phone: properties.phone || null,
        lifecycleStage: properties.lifecyclestage || null,
        leadStatus: properties.hs_lead_status || null,
        properties: this.cleanProperties(properties),
        hubspotCreatedAt: properties.createdate ? new Date(properties.createdate) : null,
        hubspotUpdatedAt: properties.lastmodifieddate
          ? new Date(properties.lastmodifieddate)
          : null,
      };
    } catch (error) {
      this.logger.error(`Error transforming lead ${hubspotData.id}`, error);
      throw error;
    }
  }

  transformDeal(hubspotData: any): Partial<Deal> {
    try {
      const properties = hubspotData.properties || {};
      const amountStr = properties.amount || '0';
      const amountNumeric = this.parseAmount(amountStr);

      let associatedContactIds: string[] = [];
      if (properties.associatedcontacts) {
        try {
          associatedContactIds = properties.associatedcontacts
            .split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => id);
        } catch (e) {
          this.logger.warn(`Error parsing associated contacts for deal ${hubspotData.id}`);
        }
      }

      return {
        hubspotId: hubspotData.id,
        dealName: properties.dealname || null,
        amount: properties.amount || null,
        amountNumeric,
        currency: properties.dealcurrencycode || 'USD',
        pipeline: properties.pipeline || null,
        dealstage: properties.dealstage || null,
        dealType: properties.dealtype || null,
        associatedCompanyId: properties.associatedcompany || null,
        associatedContactIds: associatedContactIds.length > 0 ? associatedContactIds : null,
        closedDate: properties.closedate ? new Date(properties.closedate) : null,
        closedAt: properties.closedate ? new Date(properties.closedate) : null,
        properties: this.cleanProperties(properties),
        hubspotCreatedAt: properties.createdate ? new Date(properties.createdate) : null,
        hubspotUpdatedAt: properties.hs_lastmodifieddate
          ? new Date(properties.hs_lastmodifieddate)
          : null,
      };
    } catch (error) {
      this.logger.error(`Error transforming deal ${hubspotData.id}`, error);
      throw error;
    }
  }

  transformLeads(hubspotLeads: any[]): Partial<Lead>[] {
    return hubspotLeads.map((lead) => this.transformLead(lead));
  }

  transformDeals(hubspotDeals: any[]): Partial<Deal>[] {
    return hubspotDeals.map((deal) => this.transformDeal(deal));
  }

  private parseAmount(amountStr: string): number | null {
    if (!amountStr) return null;

    try {
      const cleaned = amountStr.toString().replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      this.logger.warn(`Error parsing amount: ${amountStr}`);
      return null;
    }
  }

  private cleanProperties(properties: Record<string, any>): Record<string, any> {
    const excludedKeys = [
      'email',
      'firstname',
      'lastname',
      'company',
      'phone',
      'lifecyclestage',
      'hs_lead_status',
      'createdate',
      'lastmodifieddate',
      'dealname',
      'amount',
      'dealcurrencycode',
      'pipeline',
      'dealstage',
      'dealtype',
      'associatedcompany',
      'associatedcontacts',
      'closedate',
      'hs_lastmodifieddate',
    ];

    const cleaned: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (!excludedKeys.includes(key.toLowerCase())) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}
