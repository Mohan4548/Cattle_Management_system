import { store, calculateAgeFromDOB } from './store.js';
import {
  BreedingInsightResult,
  BreedingStatus,
  PregnancyStatus,
  BreedingTimelineStage,
  BreedingHistorySummary,
  PregnancyDetails,
  BreedingRecord,
  Cattle,
  FarmBreedingInsightsResult,
  UpcomingDeliveryItem,
  BreedingAttentionItem,
  BreedingTrendItem
} from '../types/index.js';

export interface CollectedBreedingData {
  cattle: Cattle;
  breedingRecords: BreedingRecord[];
  latestInsemination: BreedingRecord | null;
  latestPregnancyCheck: BreedingRecord | null;
  latestCalving: BreedingRecord | null;
  offspring: Cattle[];
  confirmedPregnancyRecord: BreedingRecord | null;
}

export class CattleBreedingAnalysisService {
  private averageGestationDays: number = 283;

  /**
   * Set custom gestation period (default 283 days for bovine cattle)
   */
  public setGestationPeriod(days: number): void {
    if (days > 200 && days < 320) {
      this.averageGestationDays = days;
    }
  }

  /**
   * 1. Collect all existing breeding-related data for cattle
   */
  public collectBreedingData(cattleId: string): CollectedBreedingData {
    if (!cattleId || typeof cattleId !== 'string' || cattleId.trim() === '') {
      throw new Error('INVALID_CATTLE_ID');
    }

    const trimmedId = cattleId.trim();
    const cattle = (store.cattle || []).find(
      (c: any) => c.id === trimmedId || c.tag_number === trimmedId || c.tag_id === trimmedId
    );

    if (!cattle) {
      throw new Error('CATTLE_NOT_FOUND');
    }

    const breedingRecords: BreedingRecord[] = (store.breedingRecords || [])
      .filter((b: any) => b.cattle_id === cattle.id || b.dam_tag === cattle.tag_number)
      .sort((a: any, b: any) => {
        const dateA = a.event_date || a.ai_date || a.heat_detection_date || a.created_at || '';
        const dateB = b.event_date || b.ai_date || b.heat_detection_date || b.created_at || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

    const latestInsemination = breedingRecords.find(
      b => b.event_type === 'Insemination' || !!b.ai_date
    ) || null;

    const latestPregnancyCheck = breedingRecords.find(
      b => b.event_type === 'Pregnancy Check' || b.pregnancy_confirmed !== undefined
    ) || null;

    const latestCalving = breedingRecords.find(
      b => b.event_type === 'Calving' || !!b.actual_calving_date || !!b.calf_id
    ) || null;

    const confirmedPregnancyRecord = breedingRecords.find(
      b => b.pregnancy_confirmed === true || (b.event_type === 'Pregnancy Check' && b.outcome === 'Successful')
    ) || null;

    // Find registered offspring where dam_tag matches this cattle
    const offspring = (store.cattle || []).filter(
      (c: any) => c.dam_tag && c.dam_tag === cattle.tag_number
    );

    return {
      cattle,
      breedingRecords,
      latestInsemination,
      latestPregnancyCheck,
      latestCalving,
      offspring,
      confirmedPregnancyRecord,
    };
  }

  /**
   * 2. Validate breeding data for logical consistency
   */
  public validateBreedingData(data: CollectedBreedingData): void {
    if (!data.cattle) {
      throw new Error('CATTLE_NOT_FOUND');
    }

    // Validate event sequence dates if both exist
    if (data.latestInsemination && data.latestPregnancyCheck) {
      const insDate = data.latestInsemination.event_date || data.latestInsemination.ai_date;
      const checkDate = data.latestPregnancyCheck.event_date || data.latestPregnancyCheck.pregnancy_check_date;
      if (insDate && checkDate && new Date(checkDate).getTime() < new Date(insDate).getTime()) {
        // Log warning or handle gracefully without throwing exception
        console.warn(`[BreedingAnalysis] Pregnancy check date (${checkDate}) precedes insemination date (${insDate}) for cattle ${data.cattle.id}`);
      }
    }
  }

  /**
   * 3. Analyze Historical Breeding Records & Metrics
   */
  public analyzeBreedingHistory(data: CollectedBreedingData): BreedingHistorySummary {
    const records = data.breedingRecords;
    const totalBreedingEvents = records.length;

    const confirmedPregnancies = records.filter(
      r => r.pregnancy_confirmed === true || (r.event_type === 'Pregnancy Check' && r.outcome === 'Successful')
    ).length;

    const recordedDeliveries = records.filter(
      r => r.event_type === 'Calving' || !!r.actual_calving_date || !!r.calf_id
    ).length + data.offspring.length;

    // Distinct delivery count
    const uniqueDeliveries = Math.max(recordedDeliveries, data.offspring.length);

    const inseminationsCount = records.filter(r => r.event_type === 'Insemination' || !!r.ai_date).length;
    const breedingSuccessRate = inseminationsCount > 0
      ? Math.round((confirmedPregnancies / inseminationsCount) * 100)
      : 0;

    const latestBreedingDate = data.latestInsemination?.event_date || data.latestInsemination?.ai_date;
    const latestPregnancyCheckDate = data.latestPregnancyCheck?.event_date || data.latestPregnancyCheck?.pregnancy_check_date;
    const latestCalvingDate = data.latestCalving?.actual_calving_date || data.latestCalving?.event_date;

    return {
      totalBreedingEvents,
      confirmedPregnancies,
      recordedDeliveries: uniqueDeliveries,
      breedingSuccessRate,
      latestBreedingDate,
      latestPregnancyCheckDate,
      latestCalvingDate,
    };
  }

  /**
   * 4. Calculate Pregnancy Stage, Trimester, & Progress %
   */
  public calculatePregnancyStage(data: CollectedBreedingData, isConfirmedPregnant: boolean): PregnancyDetails {
    if (!isConfirmedPregnant) {
      return { isPregnant: false };
    }

    const insDateStr = data.latestInsemination?.event_date || data.latestInsemination?.ai_date || data.cattle.purchase_date;

    if (!insDateStr) {
      return {
        isPregnant: true,
        trimester: '2nd Trimester (Mid)',
        trimesterCode: 'TRIMESTER_2',
        progressPercentage: 50,
        careRecommendations: [
          'Maintain balanced energy-protein ratio and ensure clean water supply.',
          'Schedule veterinary prenatal checkup.'
        ]
      };
    }

    const insDate = new Date(insDateStr);
    const today = new Date();
    const diffMs = today.getTime() - insDate.getTime();
    const daysPregnant = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    const daysRemaining = Math.max(0, this.averageGestationDays - daysPregnant);
    const progressPercentage = Math.min(100, Math.round((daysPregnant / this.averageGestationDays) * 100));

    let trimester: '1st Trimester (Early)' | '2nd Trimester (Mid)' | '3rd Trimester (Late)' | 'Dry Period & Transition' = '1st Trimester (Early)';
    let trimesterCode: 'TRIMESTER_1' | 'TRIMESTER_2' | 'TRIMESTER_3' | 'DRY_PERIOD' = 'TRIMESTER_1';
    const careRecommendations: string[] = [];

    if (daysPregnant >= 223) {
      trimester = 'Dry Period & Transition';
      trimesterCode = 'DRY_PERIOD';
      careRecommendations.push('Animal in Dry Period & Transition phase. Stop milking and apply dry-cow mastitis therapy.');
      careRecommendations.push('Provide high-density transition ration with anionic salts 21 days before estimated delivery.');
      careRecommendations.push('Move to clean, cushioned calving pen and monitor for early signs of labor.');
    } else if (daysPregnant >= 190) {
      trimester = '3rd Trimester (Late)';
      trimesterCode = 'TRIMESTER_3';
      careRecommendations.push('Prepare for dry-off at Day 223 (60 days prior to expected calving).');
      careRecommendations.push('Ensure adequate calcium, phosphorus, and vitamin A/D/E supplementation for fetal skeletal growth.');
      careRecommendations.push('Reduce lactation stress and conduct udder health check prior to dry off.');
    } else if (daysPregnant >= 90) {
      trimester = '2nd Trimester (Mid)';
      trimesterCode = 'TRIMESTER_2';
      careRecommendations.push('Confirm mid-term fetal growth and body condition score (target BCS 3.25 - 3.5).');
      careRecommendations.push('Maintain balanced energy-protein ratio and ensure clean, ad-libitum water supply.');
      careRecommendations.push('Monitor weight gain and routine peak-lactation parameters.');
    } else {
      trimester = '1st Trimester (Early)';
      trimesterCode = 'TRIMESTER_1';
      careRecommendations.push('Monitor for early heat recurrence around Day 21 and Day 42 post-service.');
      careRecommendations.push('Schedule ultrasound pregnancy confirmation between 30-45 days post-service.');
      careRecommendations.push('Avoid sudden diet changes or severe physical stress during early embryonic implantation.');
    }

    const dryDate = new Date(insDateStr);
    dryDate.setDate(dryDate.getDate() + 223);
    const dryOffDate = dryDate.toISOString().split('T')[0];

    return {
      isPregnant: true,
      daysPregnant,
      daysRemaining,
      trimester,
      trimesterCode,
      progressPercentage,
      dryOffDate,
      careRecommendations,
    };
  }

  /**
   * 5. Calculate Expected Delivery Date & Delivery Window
   */
  public calculateExpectedDelivery(data: CollectedBreedingData): {
    estimatedDeliveryDate?: string;
    estimatedDeliveryWindow?: { start: string; end: string };
    dryOffDate?: string;
  } {
    // Check if expected date is explicitly stored in breeding records
    let baseDeliveryDateStr = data.latestInsemination?.expected_calving_date ||
      data.latestInsemination?.expected_delivery_date ||
      data.confirmedPregnancyRecord?.expected_calving_date ||
      data.confirmedPregnancyRecord?.expected_delivery_date;

    const insDateStr = data.latestInsemination?.event_date || data.latestInsemination?.ai_date;

    if (!baseDeliveryDateStr && insDateStr) {
      const insDate = new Date(insDateStr);
      insDate.setDate(insDate.getDate() + this.averageGestationDays);
      baseDeliveryDateStr = insDate.toISOString().split('T')[0];
    }

    let dryOffDate: string | undefined;
    if (insDateStr) {
      const dDate = new Date(insDateStr);
      dDate.setDate(dDate.getDate() + 223);
      dryOffDate = dDate.toISOString().split('T')[0];
    }

    if (!baseDeliveryDateStr) {
      return { dryOffDate };
    }

    const targetDate = new Date(baseDeliveryDateStr);
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 8); // Window starts 8 days before baseline

    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 8); // Window ends 8 days after baseline

    return {
      estimatedDeliveryDate: baseDeliveryDateStr,
      estimatedDeliveryWindow: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      dryOffDate,
    };
  }

  /**
   * 6. Calculate Factual Pregnancy/Breeding Timeline Stages
   */
  public calculateBreedingTimeline(
    data: CollectedBreedingData,
    pregnancyStatus: PregnancyStatus,
    deliveryInfo: { estimatedDeliveryDate?: string; estimatedDeliveryWindow?: { start: string; end: string } }
  ): BreedingTimelineStage[] {
    const timeline: BreedingTimelineStage[] = [];

    // Stage 1: Breeding / Insemination
    if (data.latestInsemination) {
      timeline.push({
        stage: 'Insemination / Service',
        date: data.latestInsemination.event_date || data.latestInsemination.ai_date,
        status: 'completed',
        description: `Artificial Insemination recorded with sire ${data.latestInsemination.sire_info || data.latestInsemination.sire_tag || 'Standard'}.`
      });
    } else {
      timeline.push({
        stage: 'Insemination / Service',
        status: 'unconfirmed',
        description: 'No active insemination or service event logged.'
      });
    }

    // Stage 2: Pregnancy Check
    if (data.latestPregnancyCheck) {
      const isConfirmed = data.latestPregnancyCheck.pregnancy_confirmed || data.latestPregnancyCheck.outcome === 'Successful';
      timeline.push({
        stage: 'Pregnancy Confirmation',
        date: data.latestPregnancyCheck.event_date || data.latestPregnancyCheck.pregnancy_check_date,
        status: 'completed',
        description: isConfirmed ? 'Pregnancy clinically confirmed.' : 'Pregnancy check conducted; pending confirmation.'
      });
    } else {
      timeline.push({
        stage: 'Pregnancy Confirmation',
        status: 'unconfirmed',
        description: 'Pregnancy confirmation not recorded.'
      });
    }

    // Stage 3: Pregnancy Monitoring (if confirmed)
    if (pregnancyStatus === 'CONFIRMED') {
      timeline.push({
        stage: 'Pregnancy Monitoring',
        status: 'current',
        description: 'Active pregnancy monitoring. Regular body condition and nutrition tracking required.'
      });
    }

    // Stage 4: Expected Delivery Window
    if (deliveryInfo.estimatedDeliveryDate) {
      timeline.push({
        stage: 'Expected Delivery Window',
        date: deliveryInfo.estimatedDeliveryDate,
        status: pregnancyStatus === 'CONFIRMED' ? 'upcoming' : 'unconfirmed',
        description: deliveryInfo.estimatedDeliveryWindow
          ? `Estimated window: ${deliveryInfo.estimatedDeliveryWindow.start} to ${deliveryInfo.estimatedDeliveryWindow.end}.`
          : `Estimated delivery date: ${deliveryInfo.estimatedDeliveryDate}.`
      });
    }

    // Stage 5: Calving / Delivery
    if (data.latestCalving) {
      timeline.push({
        stage: 'Delivery / Calving',
        date: data.latestCalving.actual_calving_date || data.latestCalving.event_date,
        status: 'completed',
        description: `Calving completed. Outcome: ${data.latestCalving.outcome || 'Successful'}.`
      });
    }

    // Stage 6: Offspring Registration
    if (data.offspring.length > 0) {
      const calf = data.offspring[0];
      timeline.push({
        stage: 'Offspring Registration',
        date: calf.date_of_birth,
        status: 'completed',
        description: `Offspring registered: ${calf.name} (${calf.tag_number || calf.id}).`
      });
    }

    return timeline;
  }

  /**
   * 7. Identify Missing Data Points
   */
  public identifyMissingBreedingData(data: CollectedBreedingData): string[] {
    const missing: string[] = [];

    if (data.cattle.gender !== 'female') {
      missing.push('Cattle is male; female breeding analysis rules apply differently.');
    }

    if (!data.latestInsemination) {
      missing.push('No insemination/service event date logged');
    } else if (!data.latestInsemination.sire_info && !data.latestInsemination.sire_tag) {
      missing.push('Sire identification not recorded');
    }

    if (!data.latestPregnancyCheck) {
      missing.push('Pregnancy check / diagnosis date not recorded');
    }

    if (data.cattle.health_status === 'pregnant' && !data.confirmedPregnancyRecord) {
      missing.push('Cattle health status set to pregnant, but formal pregnancy check record is unconfirmed');
    }

    return missing;
  }

  /**
   * 8. Build Complete Factual Breeding Insight Result
   */
  public buildBreedingInsight(
    cattleId: string,
    data: CollectedBreedingData,
    history: BreedingHistorySummary,
    deliveryInfo: { estimatedDeliveryDate?: string; estimatedDeliveryWindow?: { start: string; end: string }; dryOffDate?: string },
    missingData: string[]
  ): BreedingInsightResult {
    const { cattle } = data;

    // Determine Pregnancy Status strictly from actual confirmed data
    let pregnancyStatus: PregnancyStatus = 'NOT_PREGNANT';
    if (data.latestCalving) {
      pregnancyStatus = 'DELIVERED';
    } else if (cattle.health_status === 'pregnant' || data.confirmedPregnancyRecord) {
      pregnancyStatus = 'CONFIRMED';
    } else if (data.latestInsemination) {
      pregnancyStatus = 'UNCONFIRMED';
    }

    // Determine Breeding Status
    let breedingStatus: BreedingStatus = 'NOT_BRED';
    if (pregnancyStatus === 'DELIVERED') {
      breedingStatus = 'DELIVERED';
    } else if (pregnancyStatus === 'CONFIRMED') {
      breedingStatus = 'PREGNANT';
    } else if (data.latestInsemination) {
      breedingStatus = 'INSEMINATED';
    }

    const isConfirmedPregnant = pregnancyStatus === 'CONFIRMED';
    const pregnancyDetails = this.calculatePregnancyStage(data, isConfirmedPregnant);
    const timeline = this.calculateBreedingTimeline(data, pregnancyStatus, deliveryInfo);

    // Generate Factual Insights Notes
    const insights: string[] = [];

    if (breedingStatus === 'PREGNANT') {
      insights.push(`Pregnancy confirmed for ${cattle.name} (${cattle.tag_number}).`);
      if (pregnancyDetails.trimester) {
        insights.push(`Currently in ${pregnancyDetails.trimester} (${pregnancyDetails.daysPregnant || 0} days pregnant).`);
      }
      if (deliveryInfo.estimatedDeliveryDate) {
        insights.push(`Estimated delivery date: ${deliveryInfo.estimatedDeliveryDate}.`);
      }
      if (deliveryInfo.estimatedDeliveryWindow) {
        insights.push(`Expected delivery window: ${deliveryInfo.estimatedDeliveryWindow.start} to ${deliveryInfo.estimatedDeliveryWindow.end}.`);
      }
    } else if (breedingStatus === 'INSEMINATED') {
      insights.push(`Insemination logged on ${history.latestBreedingDate || 'recent date'}.`);
      insights.push('Pregnancy confirmation not recorded. Schedule veterinary pregnancy check.');
    } else if (breedingStatus === 'DELIVERED') {
      insights.push(`Latest delivery completed on ${history.latestCalvingDate || 'recorded date'}.`);
      if (data.offspring.length > 0) {
        insights.push(`${data.offspring.length} registered offspring linked to this dam.`);
      }
    } else {
      insights.push(`No active breeding or pregnancy records found for ${cattle.name}.`);
    }

    if (history.totalBreedingEvents > 0) {
      insights.push(`Historical records: ${history.totalBreedingEvents} breeding event(s), ${history.confirmedPregnancies} confirmed pregnancy(ies).`);
    } else {
      insights.push('Insufficient breeding history for multi-cycle trend analysis.');
    }

    const age = calculateAgeFromDOB(cattle.date_of_birth || (cattle as any).dob);
    const latestPregnancyCheckDate = data.latestPregnancyCheck?.event_date || data.latestPregnancyCheck?.pregnancy_check_date;

    return {
      cattleId: cattle.id,
      tagNumber: cattle.tag_number || (cattle as any).tag_id || 'FE-UNKNOWN',
      name: cattle.name || 'Unnamed Cattle',
      breed: cattle.breed || 'Unknown',
      gender: cattle.gender || 'female',
      age,
      breedingStatus,
      pregnancyStatus,
      latestBreedingDate: history.latestBreedingDate,
      pregnancyConfirmationDate: latestPregnancyCheckDate,
      estimatedDeliveryDate: deliveryInfo.estimatedDeliveryDate,
      estimatedDeliveryWindow: deliveryInfo.estimatedDeliveryWindow,
      dryOffDate: deliveryInfo.dryOffDate || pregnancyDetails.dryOffDate,
      pregnancyDetails,
      timeline,
      breedingHistory: history,
      missingData,
      insights,
      analyzedAt: new Date().toISOString(),
      disclaimer: 'AI Breeding Insight & Pregnancy Timeline based on recorded farm events. Decision-support tool only; not a substitute for clinical veterinary diagnosis.',
    };
  }

  /**
   * Main entry point: Get structured AI Breeding Insight for a cattle
   */
  public async getBreedingInsight(cattleId: string): Promise<BreedingInsightResult> {
    const data = this.collectBreedingData(cattleId);
    this.validateBreedingData(data);

    const history = this.analyzeBreedingHistory(data);
    const deliveryInfo = this.calculateExpectedDelivery(data);
    const missingData = this.identifyMissingBreedingData(data);

    return this.buildBreedingInsight(cattleId, data, history, deliveryInfo, missingData);
  }

  /**
   * Phase 10C: Main entry point for Farm-Level Breeding & Pregnancy Intelligence
   */
  public async getFarmBreedingInsights(): Promise<FarmBreedingInsightsResult> {
    const allCattle: Cattle[] = store.cattle || [];
    const allBreedingRecords: BreedingRecord[] = store.breedingRecords || [];

    const femaleCattle = allCattle.filter(
      c => (c.gender || '').toLowerCase() === 'female' || (c.gender || '').toLowerCase() === 'cow'
    );

    const targetCattle = femaleCattle.length > 0 ? femaleCattle : allCattle;
    const today = new Date();

    const individualInsights: BreedingInsightResult[] = [];
    for (const cattle of targetCattle) {
      try {
        const insight = await this.getBreedingInsight(cattle.id);
        individualInsights.push(insight);
      } catch (e) {
        // Skip if cattle context is invalid
      }
    }

    // 1. Summary Calculation
    const totalBreedingRecords = allBreedingRecords.length;
    const confirmedPregnancies = individualInsights.filter(i => i.pregnancyStatus === 'CONFIRMED').length;
    const delivered = individualInsights.filter(i => i.pregnancyStatus === 'DELIVERED').length;
    const incompleteRecords = individualInsights.filter(i => i.missingData && i.missingData.length > 0).length;

    // Upcoming estimated deliveries
    const upcomingDeliveries: UpcomingDeliveryItem[] = individualInsights
      .filter(i => i.pregnancyStatus === 'CONFIRMED' && i.estimatedDeliveryDate)
      .map(i => {
        const delDate = new Date(i.estimatedDeliveryDate!);
        const diffMs = delDate.getTime() - today.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return {
          cattleId: i.cattleId,
          cattleTag: i.tagNumber,
          cattleName: i.name,
          breed: i.breed,
          pregnancyStatus: i.pregnancyStatus,
          estimatedDeliveryDate: i.estimatedDeliveryDate!,
          estimatedDeliveryWindow: i.estimatedDeliveryWindow,
          dryOffDate: i.dryOffDate,
          daysRemaining,
        };
      })
      .sort((a, b) => new Date(a.estimatedDeliveryDate).getTime() - new Date(b.estimatedDeliveryDate).getTime());

    const summary = {
      totalBreedingRecords,
      confirmedPregnancies,
      upcomingDeliveries: upcomingDeliveries.length,
      delivered,
      incompleteRecords,
      hasData: totalBreedingRecords > 0 || targetCattle.length > 0,
    };

    // 2. Pregnancy Overview breakdown
    const pregnancyOverview = {
      confirmed: confirmedPregnancies,
      unconfirmed: individualInsights.filter(i => i.pregnancyStatus === 'UNCONFIRMED').length,
      delivered: delivered,
      notPregnant: individualInsights.filter(i => i.pregnancyStatus === 'NOT_PREGNANT').length,
      unknown: Math.max(0, targetCattle.length - (confirmedPregnancies + delivered + individualInsights.filter(i => i.pregnancyStatus === 'UNCONFIRMED' || i.pregnancyStatus === 'NOT_PREGNANT').length)),
    };

    // 3. Cattle Requiring Attention
    const attentionRequired: BreedingAttentionItem[] = [];

    individualInsights.forEach(i => {
      if (i.pregnancyStatus === 'UNCONFIRMED' && i.latestBreedingDate) {
        const bDate = new Date(i.latestBreedingDate);
        const daysSinceBreeding = Math.floor((today.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceBreeding > 35) {
          attentionRequired.push({
            cattleId: i.cattleId,
            cattleTag: i.tagNumber,
            cattleName: i.name,
            breed: i.breed,
            issue: `Inseminated ${daysSinceBreeding} days ago, pregnancy confirmation check is pending.`,
            relevantDate: i.latestBreedingDate,
          });
        }
      }

      if (i.estimatedDeliveryDate) {
        const delDate = new Date(i.estimatedDeliveryDate);
        if (delDate.getTime() < today.getTime() && i.pregnancyStatus === 'CONFIRMED') {
          attentionRequired.push({
            cattleId: i.cattleId,
            cattleTag: i.tagNumber,
            cattleName: i.name,
            breed: i.breed,
            issue: `Estimated delivery date (${i.estimatedDeliveryDate}) has passed without a logged calving record.`,
            relevantDate: i.estimatedDeliveryDate,
          });
        }
      }

      if (i.missingData && i.missingData.length > 0) {
        // Prevent duplicate entry if already added
        if (!attentionRequired.some(a => a.cattleId === i.cattleId)) {
          attentionRequired.push({
            cattleId: i.cattleId,
            cattleTag: i.tagNumber,
            cattleName: i.name,
            breed: i.breed,
            issue: i.missingData[0],
            relevantDate: i.latestBreedingDate || i.pregnancyConfirmationDate,
          });
        }
      }
    });

    // 4. Data Quality Calculation
    let missingBreedingDateCount = 0;
    let missingPregnancyCheckCount = 0;
    let missingDeliveryInfoCount = 0;

    allBreedingRecords.forEach(b => {
      if (!b.event_date && !b.ai_date) missingBreedingDateCount++;
      if (b.event_type === 'Insemination' && b.outcome === 'Pending' && !b.pregnancy_confirmed) missingPregnancyCheckCount++;
    });

    individualInsights.forEach(i => {
      if (i.pregnancyStatus === 'CONFIRMED' && !i.estimatedDeliveryDate) {
        missingDeliveryInfoCount++;
      }
    });

    const incompleteRecordsCount = incompleteRecords;
    const totalAnalyzed = Math.max(1, targetCattle.length);
    const qualityScorePercentage = Math.min(100, Math.max(0, Math.round(((totalAnalyzed - incompleteRecordsCount) / totalAnalyzed) * 100)));

    const dataQuality = {
      totalCattleAnalyzed: targetCattle.length,
      incompleteRecordsCount,
      missingBreedingDateCount,
      missingPregnancyCheckCount,
      missingDeliveryInfoCount,
      qualityScorePercentage,
    };

    // 5. Breeding Trends Calculation (Only if >= 2 records exist)
    const breedingTrends: BreedingTrendItem[] = [];
    const confirmationTrends: BreedingTrendItem[] = [];

    if (allBreedingRecords.length >= 2) {
      const monthlyBreedingCounts: Record<string, number> = {};
      const monthlyConfirmationCounts: Record<string, number> = {};

      allBreedingRecords.forEach(b => {
        const dStr = b.event_date || b.ai_date || (b as any).created_at;
        if (dStr) {
          const d = new Date(dStr);
          if (!isNaN(d.getTime())) {
            const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyBreedingCounts[key] = (monthlyBreedingCounts[key] || 0) + 1;

            if (b.pregnancy_confirmed || (b.event_type === 'Pregnancy Check' && b.outcome === 'Successful')) {
              monthlyConfirmationCounts[key] = (monthlyConfirmationCounts[key] || 0) + 1;
            }
          }
        }
      });

      Object.keys(monthlyBreedingCounts).forEach(period => {
        breedingTrends.push({ period, count: monthlyBreedingCounts[period] });
      });

      Object.keys(monthlyConfirmationCounts).forEach(period => {
        confirmationTrends.push({ period, count: monthlyConfirmationCounts[period] });
      });
    }

    // 6. Breeding Performance Metrics Calculation
    const inseminations = allBreedingRecords.filter(b => b.event_type === 'Insemination' || !!b.ai_date);
    const totalBreedingEvents = inseminations.length > 0 ? inseminations.length : allBreedingRecords.length;
    const recordedDeliveries = allBreedingRecords.filter(b => b.event_type === 'Calving' || !!b.actual_calving_date).length;

    const hasSufficientData = totalBreedingEvents >= 2;
    const pregnancyConfirmationRate = hasSufficientData
      ? Math.min(100, Math.max(0, Math.round((confirmedPregnancies / totalBreedingEvents) * 100)))
      : null;

    const performanceMetrics = {
      totalBreedingEvents,
      confirmedPregnancies,
      recordedDeliveries,
      pregnancyConfirmationRate,
      hasSufficientData,
    };

    // 7. Dynamic Factual Insights Generation
    const insights: string[] = [];

    if (!summary.hasData) {
      insights.push('No breeding information is currently available for farm-level analysis.');
    } else {
      if (confirmedPregnancies > 0 || upcomingDeliveries.length > 0) {
        insights.push(`Your farm currently has ${confirmedPregnancies} confirmed ${confirmedPregnancies === 1 ? 'pregnancy' : 'pregnancies'} and ${upcomingDeliveries.length} estimated ${upcomingDeliveries.length === 1 ? 'delivery' : 'deliveries'} approaching.`);
      }

      if (incompleteRecords > 0) {
        insights.push(`${incompleteRecords} breeding ${incompleteRecords === 1 ? 'record has' : 'records have'} missing details. Updating missing pregnancy confirmation information can improve record accuracy.`);
      }

      if (attentionRequired.length > 0) {
        insights.push(`${attentionRequired.length} ${attentionRequired.length === 1 ? 'cattle requires' : 'cattle require'} breeding follow-up or record verification.`);
      } else {
        insights.push('All recorded breeding records are up to date and verified.');
      }
    }

    return {
      summary,
      pregnancyOverview,
      upcomingDeliveries,
      attentionRequired,
      breedingTrends,
      confirmationTrends,
      dataQuality,
      performanceMetrics,
      insights,
      analyzedAt: new Date().toISOString(),
      disclaimer: 'Farm Breeding Intelligence derived strictly from recorded farm data. Record-based decision-support tool only; not a substitute for clinical veterinary diagnosis.',
    };
  }
}

export const cattleBreedingAnalysisService = new CattleBreedingAnalysisService();

