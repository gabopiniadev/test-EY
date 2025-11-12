import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Lead } from '../../database/entities/lead.entity';
import { Deal } from '../../database/entities/deal.entity';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    private cacheService: CacheService,
  ) {}

  async getLeadsStats(startDate?: Date, endDate?: Date) {
    const cacheKey = `analytics:leads:stats:${startDate?.toISOString()}:${endDate?.toISOString()}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const query = this.leadRepository.createQueryBuilder('lead');

    if (startDate && endDate) {
      query.where('lead.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.where('lead.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      query.where('lead.createdAt <= :endDate', { endDate });
    }

    const total = await query.getCount();

    const byLifecycleStage = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.lifecycleStage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .where(startDate && endDate ? 'lead.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .groupBy('lead.lifecycleStage')
      .getRawMany();

    const byStatus = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.leadStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(startDate && endDate ? 'lead.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .groupBy('lead.leadStatus')
      .getRawMany();

    const convertedLeads = await this.leadRepository
      .createQueryBuilder('lead')
      .where('lead.lifecycleStage = :stage', { stage: 'customer' })
      .andWhere(startDate && endDate ? 'lead.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .getCount();

    const conversionRate = total > 0 ? (convertedLeads / total) * 100 : 0;

    const result = {
      total,
      byLifecycleStage: byLifecycleStage.map((item) => ({
        stage: item.stage || 'Unknown',
        count: parseInt(item.count),
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status || 'Unknown',
        count: parseInt(item.count),
      })),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      convertedLeads,
    };

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async getDealsAnalysis(startDate?: Date, endDate?: Date) {
    const cacheKey = `analytics:deals:analysis:${startDate?.toISOString()}:${endDate?.toISOString()}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const query = this.dealRepository.createQueryBuilder('deal');

    if (startDate && endDate) {
      query.where('deal.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.where('deal.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      query.where('deal.createdAt <= :endDate', { endDate });
    }

    const total = await query.getCount();

    const byStage = await this.dealRepository
      .createQueryBuilder('deal')
      .select('deal.dealstage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(deal.amountNumeric)', 'totalAmount')
      .where(startDate && endDate ? 'deal.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .groupBy('deal.dealstage')
      .getRawMany();

    const byPipeline = await this.dealRepository
      .createQueryBuilder('deal')
      .select('deal.pipeline', 'pipeline')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(deal.amountNumeric)', 'totalAmount')
      .where(startDate && endDate ? 'deal.createdAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .groupBy('deal.pipeline')
      .getRawMany();

    const totalAmountResult = await query.select('SUM(deal.amountNumeric)', 'total').getRawOne();
    const totalAmount = totalAmountResult?.total || 0;

    const closedDeals = await this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.closedAt IS NOT NULL')
      .andWhere(startDate && endDate ? 'deal.closedAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .getCount();

    const closedAmountResult = await this.dealRepository
      .createQueryBuilder('deal')
      .select('SUM(deal.amountNumeric)', 'total')
      .where('deal.closedAt IS NOT NULL')
      .andWhere(startDate && endDate ? 'deal.closedAt BETWEEN :startDate AND :endDate' : '1=1', {
        startDate,
        endDate,
      })
      .getRawOne();
    const closedAmount = closedAmountResult?.total || 0;

    const winRate = total > 0 ? (closedDeals / total) * 100 : 0;

    const result = {
      total,
      totalAmount: parseFloat(totalAmount),
      closedDeals,
      closedAmount: parseFloat(closedAmount),
      winRate: parseFloat(winRate.toFixed(2)),
      byStage: byStage.map((item) => ({
        stage: item.stage || 'Unknown',
        count: parseInt(item.count),
        totalAmount: parseFloat(item.totalAmount || 0),
      })),
      byPipeline: byPipeline.map((item) => ({
        pipeline: item.pipeline || 'Unknown',
        count: parseInt(item.count),
        totalAmount: parseFloat(item.totalAmount || 0),
      })),
    };

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }
}
