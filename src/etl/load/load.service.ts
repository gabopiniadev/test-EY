import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../database/entities/lead.entity';
import { Deal } from '../../database/entities/deal.entity';

@Injectable()
export class LoadService {
  private readonly logger = new Logger(LoadService.name);

  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
  ) {}

  async loadLeads(
    transformedLeads: Partial<Lead>[],
  ): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    this.logger.log(`Loading ${transformedLeads.length} leads...`);

    for (const leadData of transformedLeads) {
      try {
        const existingLead = await this.leadRepository.findOne({
          where: { hubspotId: leadData.hubspotId },
        });

        if (existingLead) {
          await this.leadRepository.update(existingLead.id, leadData);
          updated++;
        } else {
          await this.leadRepository.save(leadData);
          created++;
        }
      } catch (error) {
        this.logger.error(`Error loading lead ${leadData.hubspotId}`, error);
      }
    }

    this.logger.log(`Leads loaded: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  async loadDeals(
    transformedDeals: Partial<Deal>[],
  ): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    this.logger.log(`Loading ${transformedDeals.length} deals...`);

    for (const dealData of transformedDeals) {
      try {
        const existingDeal = await this.dealRepository.findOne({
          where: { hubspotId: dealData.hubspotId },
        });

        if (existingDeal) {
          await this.dealRepository.update(existingDeal.id, dealData);
          updated++;
        } else {
          await this.dealRepository.save(dealData);
          created++;
        }
      } catch (error) {
        this.logger.error(`Error loading deal ${dealData.hubspotId}`, error);
      }
    }

    this.logger.log(`Deals loaded: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  async loadLeadsBatch(
    transformedLeads: Partial<Lead>[],
    batchSize = 100,
  ): Promise<{ created: number; updated: number }> {
    let totalCreated = 0;
    let totalUpdated = 0;

    for (let i = 0; i < transformedLeads.length; i += batchSize) {
      const batch = transformedLeads.slice(i, i + batchSize);
      const result = await this.loadLeads(batch);
      totalCreated += result.created;
      totalUpdated += result.updated;
    }

    return { created: totalCreated, updated: totalUpdated };
  }

  async loadDealsBatch(
    transformedDeals: Partial<Deal>[],
    batchSize = 100,
  ): Promise<{ created: number; updated: number }> {
    let totalCreated = 0;
    let totalUpdated = 0;

    for (let i = 0; i < transformedDeals.length; i += batchSize) {
      const batch = transformedDeals.slice(i, i + batchSize);
      const result = await this.loadDeals(batch);
      totalCreated += result.created;
      totalUpdated += result.updated;
    }

    return { created: totalCreated, updated: totalUpdated };
  }
}
