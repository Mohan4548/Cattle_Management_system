import { store, calculateAgeFromDOB } from './store.js';
import {
  HealthRiskResult,
  HealthRiskInputSummary,
  HealthRiskLevel,
  HealthRiskConfidence,
  ExplainableFactor,
  AIHealthInsightsSummary,
  CattleAttentionItem
} from '../types/index.js';

export interface CollectedCattleHealthData {
  cattle: any;
  
  healthRecords: any[];
  vaccinations: any[];
  breedingRecords: any[];
  activeHealthRecords: any[];
  recentEmergency: boolean;
  latestHealthRecord: any | null;
  bodyTempC: number | null;
  heartRateBpm: number | null;
  currentHealthStatus: string;
  calculatedAge: string;
  isPregnant: boolean;
  overdueVaccinationsCount: number;
}

export class CattleHealthRiskService {
  /**
   * 1. Collect all available health data for the selected cattle from store
   */
  public collectHealthData(cattleId: string): CollectedCattleHealthData {
    if (!cattleId || typeof cattleId !== 'string' || cattleId.trim() === '') {
      throw new Error('INVALID_CATTLE_ID');
    }

    const trimmedId = cattleId.trim();
    const cattle = store.cattle.find((c: any) => c.id === trimmedId || c.tag_number === trimmedId || c.tag_id === trimmedId);

    if (!cattle) {
      throw new Error('CATTLE_NOT_FOUND');
    }

    const healthRecords = (store.healthRecords || []).filter((h: any) => h.cattle_id === cattle.id);
    const vaccinations = (store.vaccinations || []).filter((v: any) => v.cattle_id === cattle.id);
    const breedingRecords = (store.breedingRecords || []).filter((b: any) => b.cattle_id === cattle.id);

    const activeHealthRecords = healthRecords.filter((h: any) => h.status === 'active' || h.is_emergency);
    const recentEmergency = healthRecords.some((h: any) => h.is_emergency);

    const latestHealthRecord = healthRecords.length > 0 ? healthRecords[0] : null;
    const bodyTempC = latestHealthRecord?.body_temp_c !== undefined ? Number(latestHealthRecord.body_temp_c) : null;
    const heartRateBpm = latestHealthRecord?.heart_rate_bpm !== undefined ? Number(latestHealthRecord.heart_rate_bpm) : null;

    const currentHealthStatus = cattle.health_status || cattle.status || 'healthy';
    const calculatedAge = calculateAgeFromDOB(cattle.date_of_birth || cattle.dob);

    const isPregnant = currentHealthStatus === 'pregnant' || breedingRecords.some((b: any) => b.pregnancy_confirmed);

    // Overdue vaccination check
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueVaccinationsCount = vaccinations.filter((v: any) => v.next_due_date && v.next_due_date < todayStr).length;

    return {
      cattle,
      healthRecords,
      vaccinations,
      breedingRecords,
      activeHealthRecords,
      recentEmergency,
      latestHealthRecord,
      bodyTempC,
      heartRateBpm,
      currentHealthStatus,
      calculatedAge,
      isPregnant,
      overdueVaccinationsCount,
    };
  }

  /**
   * 2. Validate input health data
   */
  public validateHealthData(data: CollectedCattleHealthData): void {
    if (!data.cattle) {
      throw new Error('CATTLE_NOT_FOUND');
    }
    // Check for invalid numeric values if present
    if (data.bodyTempC !== null && (isNaN(data.bodyTempC) || data.bodyTempC < 30 || data.bodyTempC > 45)) {
      data.bodyTempC = null; // reset out-of-bound temp safely
    }
    if (data.heartRateBpm !== null && (isNaN(data.heartRateBpm) || data.heartRateBpm < 20 || data.heartRateBpm > 200)) {
      data.heartRateBpm = null; // reset out-of-bound heart rate safely
    }
  }

  /**
   * 3. Calculate Risk Score (0 - 100)
   */
  public calculateRiskScore(data: CollectedCattleHealthData): number {
    let score = 10; // Baseline low risk score

    // Health status impact
    if (data.currentHealthStatus === 'sick' || data.currentHealthStatus === 'quarantined') {
      score += 50;
    } else if (data.currentHealthStatus === 'under_treatment') {
      score += 30;
    } else if (data.isPregnant) {
      score += 5; // Routine prenatal watch
    }

    // Emergency flag
    if (data.recentEmergency) {
      score += 25;
    }

    // Body Temperature check
    if (data.bodyTempC !== null) {
      if (data.bodyTempC > 39.5) {
        score += 25; // High fever
      } else if (data.bodyTempC > 39.0) {
        score += 15; // Mild elevation
      } else if (data.bodyTempC < 37.5) {
        score += 25; // Hypothermia
      }
    }

    // Heart Rate check
    if (data.heartRateBpm !== null) {
      if (data.heartRateBpm > 85) {
        score += 15; // Tachycardia
      } else if (data.heartRateBpm < 50) {
        score += 10; // Bradycardia
      }
    }

    // Active health records count
    if (data.activeHealthRecords.length > 0) {
      score += Math.min(data.activeHealthRecords.length * 15, 30);
    }

    // Overdue vaccinations
    if (data.overdueVaccinationsCount > 0) {
      score += 15;
    }

    // Clamp score strictly between 0 and 100
    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  /**
   * 4. Determine Risk Level from score
   */
  public determineRiskLevel(score: number): HealthRiskLevel {
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 5. Identify Explainable Risk Factors
   */
  public identifyRiskFactors(data: CollectedCattleHealthData): ExplainableFactor[] {
    const factors: ExplainableFactor[] = [];

    if (data.currentHealthStatus === 'sick' || data.currentHealthStatus === 'quarantined') {
      factors.push({
        factor: 'Current Health Status',
        impact: 'High',
        description: `Logged health status is '${data.currentHealthStatus}'. Immediate care or isolation needed.`
      });
    } else if (data.currentHealthStatus === 'under_treatment') {
      factors.push({
        factor: 'Active Medical Treatment',
        impact: 'Medium',
        description: 'Animal is currently undergoing prescribed medical treatment.'
      });
    }

    if (data.recentEmergency) {
      factors.push({
        factor: 'Emergency Event Record',
        impact: 'High',
        description: 'Active or recent emergency medical event recorded in health history.'
      });
    }

    if (data.bodyTempC !== null) {
      if (data.bodyTempC > 39.5) {
        factors.push({
          factor: 'Elevated Body Temperature',
          impact: 'High',
          description: `Recorded body temperature is ${data.bodyTempC}°C (above normal threshold of 39.0°C).`
        });
      } else if (data.bodyTempC < 37.5) {
        factors.push({
          factor: 'Hypothermic Temperature',
          impact: 'High',
          description: `Recorded body temperature is ${data.bodyTempC}°C (below normal threshold of 37.5°C).`
        });
      } else {
        factors.push({
          factor: 'Normal Body Temperature',
          impact: 'Low',
          description: `Recorded temperature is ${data.bodyTempC}°C within expected physiological range.`
        });
      }
    }

    if (data.heartRateBpm !== null) {
      if (data.heartRateBpm > 85 || data.heartRateBpm < 50) {
        factors.push({
          factor: 'Abnormal Heart Rate',
          impact: 'Medium',
          description: `Recorded heart rate of ${data.heartRateBpm} BPM deviates from baseline standard.`
        });
      }
    }

    if (data.overdueVaccinationsCount > 0) {
      factors.push({
        factor: 'Overdue Vaccination',
        impact: 'Medium',
        description: `${data.overdueVaccinationsCount} scheduled vaccination protocol(s) are overdue.`
      });
    }

    if (data.isPregnant) {
      factors.push({
        factor: 'Prenatal Status',
        impact: 'Low',
        description: 'Confirmed pregnancy requiring routine prenatal monitoring and mineral management.'
      });
    }

    if (factors.length === 0) {
      factors.push({
        factor: 'Normal Health History',
        impact: 'Low',
        description: 'No active disease logs or physiological abnormalities detected in recorded parameters.'
      });
    }

    return factors;
  }

  /**
   * 6. Calculate Data Confidence / Data Quality
   */
  public calculateDataConfidence(data: CollectedCattleHealthData): HealthRiskConfidence {
    let score = 0;
    if (data.cattle.weight_kg) score += 1;
    if (data.cattle.date_of_birth || data.cattle.dob) score += 1;
    if (data.bodyTempC !== null) score += 2;
    if (data.heartRateBpm !== null) score += 1;
    if (data.healthRecords.length > 0) score += 2;
    if (data.vaccinations.length > 0) score += 1;

    if (score >= 5) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 7. Generate Recommendations based on Risk Level and Factors
   */
  public generateRecommendations(level: HealthRiskLevel, factors: ExplainableFactor[]): string[] {
    const recs: string[] = [];

    switch (level) {
      case 'HIGH':
        recs.push('Arrange immediate veterinary examination and clinical assessment.');
        recs.push('Monitor vital signs (temperature, heart rate, feed & water intake) every 4 hours.');
        recs.push('Ensure animal is isolated if infectious disease symptoms are suspected.');
        break;
      case 'MEDIUM':
        recs.push('Increase health monitoring frequency and review recent treatment logs.');
        recs.push('Ensure complete compliance with any prescribed medications or supplements.');
        recs.push('Schedule veterinary consultation if elevated temperature or symptoms persist.');
        break;
      case 'LOW':
      default:
        recs.push('Continue routine daily monitoring and standard farm nutrition protocols.');
        recs.push('Maintain regular vaccination and deworming schedule.');
        recs.push('Record periodic weight and vitals updates during routine checkups.');
        break;
    }

    const hasVaccineIssue = factors.some(f => f.factor === 'Overdue Vaccination');
    if (hasVaccineIssue) {
      recs.push('Administer overdue vaccination doses as advised by farm veterinarian.');
    }

    return recs;
  }

  /**
   * 8. Build Complete Structured Health Risk Response
   */
  public buildHealthRiskResponse(
    cattleId: string,
    data: CollectedCattleHealthData,
    score: number,
    level: HealthRiskLevel,
    confidence: HealthRiskConfidence,
    factors: ExplainableFactor[],
    recommendations: string[]
  ): HealthRiskResult {
    const inputSummary: HealthRiskInputSummary = {
      age: data.calculatedAge,
      breed: data.cattle.breed,
      gender: data.cattle.gender,
      weight_kg: data.cattle.weight_kg,
      health_status: data.currentHealthStatus as any,
      lactation_stage: data.cattle.lactation_stage,
      recent_vitals: {
        body_temp_c: data.bodyTempC ?? 38.5,
        heart_rate_bpm: data.heartRateBpm ?? 65,
      },
      total_health_records: data.healthRecords.length,
      active_health_records: data.activeHealthRecords.length,
      vaccinations_count: data.vaccinations.length,
      is_pregnant: data.isPregnant,
    };

    return {
      cattleId: data.cattle.id,
      riskLevel: level,
      riskScore: score,
      confidence,
      keyFactors: factors,
      recommendations,
      analyzedAt: new Date().toISOString(),
      safetyNotice: 'Decision-support analysis based on recorded farm parameters. Recommended Veterinary Review for concerning observations.',
      inputSummary,
    };
  }

  /**
   * Main entry point for Phase 2 health risk calculation
   */
  public async getHealthRisk(cattleId: string): Promise<HealthRiskResult> {
    const data = this.collectHealthData(cattleId);
    this.validateHealthData(data);

    const score = this.calculateRiskScore(data);
    const level = this.determineRiskLevel(score);
    const confidence = this.calculateDataConfidence(data);
    const factors = this.identifyRiskFactors(data);
    const recommendations = this.generateRecommendations(level, factors);

    return this.buildHealthRiskResponse(cattleId, data, score, level, confidence, factors, recommendations);
  }

  /**
   * Aggregates AI Health Insights for all cattle in the farm (Phase 3)
   */
  public async getAIHealthInsights(): Promise<AIHealthInsightsSummary> {
    const allCattle = store.cattle || [];
    const totalAnalyzed = allCattle.length;

    const results: HealthRiskResult[] = [];
    const attentionItems: CattleAttentionItem[] = [];

    let lowRiskCount = 0;
    let mediumRiskCount = 0;
    let highRiskCount = 0;
    let insufficientDataCount = 0;
    let highOrMediumConfidenceCount = 0;

    for (const c of allCattle) {
      try {
        const res = await this.getHealthRisk(c.id);
        results.push(res);

        if (res.confidence === 'LOW') {
          insufficientDataCount++;
        } else {
          highOrMediumConfidenceCount++;
        }

        switch (res.riskLevel) {
          case 'HIGH':
            highRiskCount++;
            break;
          case 'MEDIUM':
            mediumRiskCount++;
            break;
          case 'LOW':
          default:
            lowRiskCount++;
            break;
        }

        if (res.riskLevel === 'HIGH' || res.riskLevel === 'MEDIUM') {
          const mainFactorObj = res.keyFactors[0];
          attentionItems.push({
            id: c.id,
            tag_number: c.tag_number || c.tag_id || 'FE-CAT-UNKNOWN',
            name: c.name || 'Unnamed Cattle',
            breed: c.breed || 'Unknown Breed',
            riskLevel: res.riskLevel,
            riskScore: res.riskScore,
            confidence: res.confidence,
            mainFactor: mainFactorObj?.factor || 'General health monitoring',
            factorDescription: mainFactorObj?.description || 'Active medical or profile signals flagged.',
            lastAnalysis: res.analyzedAt,
          });
        }
      } catch (e) {
        insufficientDataCount++;
      }
    }

    const healthDataCoverage = totalAnalyzed > 0
      ? Math.round((highOrMediumConfidenceCount / totalAnalyzed) * 100)
      : 0;

    const highRiskCattle = attentionItems.filter(i => i.riskLevel === 'HIGH');
    const mediumRiskCattle = attentionItems.filter(i => i.riskLevel === 'MEDIUM');

    // Vaccination insights
    const vaccinations = store.vaccinations || [];
    const todayStr = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const overdueCount = vaccinations.filter((v: any) => v.next_due_date && v.next_due_date < todayStr).length;
    const dueSoonCount = vaccinations.filter((v: any) => v.next_due_date && v.next_due_date >= todayStr && v.next_due_date <= in30Days).length;

    // Auto-generate AI Summary text based on current real numbers
    let aiSummaryText = '';
    if (totalAnalyzed === 0) {
      aiSummaryText = 'No cattle records available in the system for AI health risk analysis.';
    } else if (highRiskCount > 0) {
      aiSummaryText = `${highRiskCount} animal(s) identified with High Risk requiring urgent veterinary evaluation. ${mediumRiskCount} animal(s) are currently under medium watch.`;
    } else if (mediumRiskCount > 0) {
      aiSummaryText = `Most analyzed cattle are in good health. ${mediumRiskCount} animal(s) require closer monitoring due to active treatment or prenatal care.`;
    } else {
      aiSummaryText = `All ${totalAnalyzed} analyzed cattle are currently in the low-risk category with normal health status and vitals.`;
    }

    if (overdueCount > 0) {
      aiSummaryText += ` Note: ${overdueCount} vaccination protocol(s) are currently overdue.`;
    }

    // Health trends calculation if historical health records exist
    const healthRecords = store.healthRecords || [];
    const hasHistoricalData = healthRecords.length >= 2;
    const healthTrends = hasHistoricalData
      ? healthRecords.slice(0, 7).map((h: any) => ({
          date: h.record_date || h.created_at?.split('T')[0] || 'Recent',
          temp: h.body_temp_c || 38.5,
          heartRate: h.heart_rate_bpm || 65,
          activeRecords: h.status === 'active' ? 1 : 0,
        }))
      : [];

    return {
      totalAnalyzed,
      lowRiskCount,
      mediumRiskCount,
      highRiskCount,
      insufficientDataCount,
      healthDataCoverage,
      riskDistribution: [
        { name: 'LOW', value: lowRiskCount, color: '#10b981' },
        { name: 'MEDIUM', value: mediumRiskCount, color: '#f59e0b' },
        { name: 'HIGH', value: highRiskCount, color: '#f43f5e' },
      ],
      cattleRequiringAttention: attentionItems,
      highRiskCattle,
      mediumRiskCattle,
      recentAnalyses: results.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()),
      vaccinationInsights: {
        dueSoonCount,
        overdueCount,
        totalVaccinations: vaccinations.length,
      },
      aiSummary: aiSummaryText,
      healthTrends,
      hasHistoricalData,
    };
  }
}

export const cattleHealthRiskService = new CattleHealthRiskService();
