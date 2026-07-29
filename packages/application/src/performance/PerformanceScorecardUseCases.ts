import { Result, PerformanceScorecardAggregate } from '@inducore/core-domain';
import { IPerformanceScorecardRepository } from './IPerformanceScorecardRepository.js';
import {
  UpdateScoresDTO,
  UpdateMetricsDTO,
  BlacklistSupplierDTO,
  RemoveBlacklistDTO,
  TogglePreferredSupplierDTO,
  UpdateRiskLevelDTO,
  RecordHistoricalTrendDTO,
  PerformanceScorecardResponseDTO,
  PerformanceKPIDashboardSummaryDTO,
} from './PerformanceScorecardDTOs.js';

export class PerformanceScorecardUseCases {
  constructor(private scorecardRepo: IPerformanceScorecardRepository) {}

  public async getAllScorecards(): Promise<Result<PerformanceScorecardResponseDTO[]>> {
    try {
      const scorecards = await this.scorecardRepo.findAll();
      return Result.ok<PerformanceScorecardResponseDTO[]>(scorecards.map((s) => this.toDTO(s)));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO[]>(
        err.message || 'Failed to fetch performance scorecards'
      );
    }
  }

  public async getScorecardBySupplierId(
    supplierId: string
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>(
          `Performance scorecard for supplier ${supplierId} not found`
        );
      }
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to fetch scorecard'
      );
    }
  }

  public async updateScores(
    dto: UpdateScoresDTO
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(dto.supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>('Scorecard not found');
      }

      const updateRes = scorecard.updateScores({
        qualityScore: dto.qualityScore,
        deliveryScore: dto.deliveryScore,
        costScore: dto.costScore,
        responsivenessScore: dto.responsivenessScore,
        evaluatedBy: dto.evaluatedBy,
      });

      if (updateRes.isFailure) {
        return Result.fail<PerformanceScorecardResponseDTO>(updateRes.errorValue());
      }

      await this.scorecardRepo.save(scorecard);
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to update scores'
      );
    }
  }

  public async updateMetrics(
    dto: UpdateMetricsDTO
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(dto.supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>('Scorecard not found');
      }

      scorecard.updateMetrics(dto.metrics);
      await this.scorecardRepo.save(scorecard);
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to update metrics'
      );
    }
  }

  public async blacklistSupplier(
    dto: BlacklistSupplierDTO
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(dto.supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>('Scorecard not found');
      }

      const blRes = scorecard.blacklistSupplier(dto.reason, dto.blacklistedBy);
      if (blRes.isFailure) {
        return Result.fail<PerformanceScorecardResponseDTO>(blRes.errorValue());
      }

      await this.scorecardRepo.save(scorecard);
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to blacklist supplier'
      );
    }
  }

  public async removeBlacklist(
    dto: RemoveBlacklistDTO
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(dto.supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>('Scorecard not found');
      }

      const remRes = scorecard.removeBlacklist(dto.removedBy);
      if (remRes.isFailure) {
        return Result.fail<PerformanceScorecardResponseDTO>(remRes.errorValue());
      }

      await this.scorecardRepo.save(scorecard);
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to remove blacklist'
      );
    }
  }

  public async togglePreferredSupplier(
    dto: TogglePreferredSupplierDTO
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(dto.supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>('Scorecard not found');
      }

      scorecard.togglePreferredSupplier(dto.category, dto.approvedBy);
      await this.scorecardRepo.save(scorecard);
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to toggle preferred status'
      );
    }
  }

  public async updateRiskLevel(
    dto: UpdateRiskLevelDTO
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(dto.supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>('Scorecard not found');
      }

      scorecard.updateRiskLevel(dto.riskLevel);
      await this.scorecardRepo.save(scorecard);
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to update risk level'
      );
    }
  }

  public async recordHistoricalTrend(
    dto: RecordHistoricalTrendDTO
  ): Promise<Result<PerformanceScorecardResponseDTO>> {
    try {
      const scorecard = await this.scorecardRepo.findBySupplierId(dto.supplierId);
      if (!scorecard) {
        return Result.fail<PerformanceScorecardResponseDTO>('Scorecard not found');
      }

      const trendRes = scorecard.recordHistoricalTrendPoint(dto.period, dto.notes);
      if (trendRes.isFailure) {
        return Result.fail<PerformanceScorecardResponseDTO>(trendRes.errorValue());
      }

      await this.scorecardRepo.save(scorecard);
      return Result.ok<PerformanceScorecardResponseDTO>(this.toDTO(scorecard));
    } catch (err: any) {
      return Result.fail<PerformanceScorecardResponseDTO>(
        err.message || 'Failed to record historical trend'
      );
    }
  }

  public async getKPIDashboardSummary(): Promise<Result<PerformanceKPIDashboardSummaryDTO>> {
    try {
      const scorecards = await this.scorecardRepo.findAll();
      const total = scorecards.length;

      if (total === 0) {
        return Result.ok<PerformanceKPIDashboardSummaryDTO>({
          totalSuppliersCount: 0,
          preferredSuppliersCount: 0,
          blacklistedSuppliersCount: 0,
          underReviewSuppliersCount: 0,
          avgQualityScore: 0,
          avgDeliveryScore: 0,
          avgCostScore: 0,
          avgResponsivenessScore: 0,
          avgOverallScore: 0,
          riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        });
      }

      let preferred = 0;
      let blacklisted = 0;
      let underReview = 0;
      let sumQuality = 0;
      let sumDelivery = 0;
      let sumCost = 0;
      let sumResp = 0;
      let sumOverall = 0;

      const riskDist = { low: 0, medium: 0, high: 0, critical: 0 };

      scorecards.forEach((s) => {
        if (s.props.preferredStatus.isPreferred) preferred++;
        if (s.props.blacklist.isBlacklisted) blacklisted++;
        if (s.props.tier === 'UNDER_REVIEW') underReview++;

        sumQuality += s.props.qualityScore;
        sumDelivery += s.props.deliveryScore;
        sumCost += s.props.costScore;
        sumResp += s.props.responsivenessScore;
        sumOverall += s.props.overallScore;

        if (s.props.riskLevel === 'LOW') riskDist.low++;
        else if (s.props.riskLevel === 'MEDIUM') riskDist.medium++;
        else if (s.props.riskLevel === 'HIGH') riskDist.high++;
        else if (s.props.riskLevel === 'CRITICAL') riskDist.critical++;
      });

      return Result.ok<PerformanceKPIDashboardSummaryDTO>({
        totalSuppliersCount: total,
        preferredSuppliersCount: preferred,
        blacklistedSuppliersCount: blacklisted,
        underReviewSuppliersCount: underReview,
        avgQualityScore: Number((sumQuality / total).toFixed(1)),
        avgDeliveryScore: Number((sumDelivery / total).toFixed(1)),
        avgCostScore: Number((sumCost / total).toFixed(1)),
        avgResponsivenessScore: Number((sumResp / total).toFixed(1)),
        avgOverallScore: Number((sumOverall / total).toFixed(1)),
        riskDistribution: riskDist,
      });
    } catch (err: any) {
      return Result.fail<PerformanceKPIDashboardSummaryDTO>(
        err.message || 'Failed to calculate KPI summary'
      );
    }
  }

  private toDTO(scorecard: PerformanceScorecardAggregate): PerformanceScorecardResponseDTO {
    return {
      id: scorecard.id.toString(),
      supplierId: scorecard.props.supplierId,
      supplierName: scorecard.props.supplierName,
      supplierCode: scorecard.props.supplierCode,
      qualityScore: scorecard.props.qualityScore,
      deliveryScore: scorecard.props.deliveryScore,
      costScore: scorecard.props.costScore,
      responsivenessScore: scorecard.props.responsivenessScore,
      overallScore: scorecard.props.overallScore,
      riskLevel: scorecard.props.riskLevel,
      tier: scorecard.props.tier,
      metrics: scorecard.props.metrics,
      blacklist: scorecard.props.blacklist,
      preferredStatus: scorecard.props.preferredStatus,
      historicalTrends: scorecard.props.historicalTrends,
      lastEvaluatedAt: scorecard.props.lastEvaluatedAt,
      evaluatedBy: scorecard.props.evaluatedBy,
      createdAt: scorecard.props.createdAt,
      updatedAt: scorecard.props.updatedAt,
    };
  }
}
