import { store } from '../backend/src/services/store.js';
import { cattleBreedingAnalysisService } from '../backend/src/services/cattleBreedingAnalysisService.js';

async function runPhase10CTests() {
  console.log('====================================================');
  console.log('FARMEASE PHASE 10C: FARM BREEDING INTELLIGENCE TEST');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] Test ${totalTests}: ${testName}${detail ? ` (${detail})` : ''}`);
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}${detail ? ` (${detail})` : ''}`);
      process.exitCode = 1;
    }
  }

  const today = new Date();
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // Setup sample test cattle and breeding records
  const cow1 = {
    id: 'test-10c-cow1',
    tag_number: 'FE-10C-01',
    name: 'Ganga',
    breed: 'Holstein Friesian',
    gender: 'female',
    date_of_birth: '2021-02-14',
    weight_kg: 510,
    health_status: 'pregnant',
    created_at: new Date().toISOString()
  };
  const cow2 = {
    id: 'test-10c-cow2',
    tag_number: 'FE-10C-02',
    name: 'Yamuna',
    breed: 'Jersey',
    gender: 'female',
    date_of_birth: '2022-05-10',
    weight_kg: 440,
    health_status: 'healthy',
    created_at: new Date().toISOString()
  };
  const cow3 = {
    id: 'test-10c-cow3',
    tag_number: 'FE-10C-03',
    name: 'Saraswati',
    breed: 'Gir',
    gender: 'female',
    date_of_birth: '2020-11-20',
    weight_kg: 480,
    health_status: 'healthy',
    created_at: new Date().toISOString()
  };

  store.cattle.push(cow1, cow2, cow3);

  // Insemination & confirmation for cow 1 (60 days ago)
  const insDate1 = formatDate(60);
  store.breedingRecords.unshift({
    id: 'br-10c-1',
    cattle_id: cow1.id,
    cattle_tag: cow1.tag_number,
    event_type: 'Insemination',
    event_date: insDate1,
    sire_info: 'BULL-HF-100'
  });
  store.breedingRecords.unshift({
    id: 'br-10c-2',
    cattle_id: cow1.id,
    cattle_tag: cow1.tag_number,
    event_type: 'Pregnancy Check',
    event_date: insDate1,
    pregnancy_confirmed: true,
    outcome: 'Successful'
  });

  // Unconfirmed insemination for cow 2 (40 days ago)
  const insDate2 = formatDate(40);
  store.breedingRecords.unshift({
    id: 'br-10c-3',
    cattle_id: cow2.id,
    cattle_tag: cow2.tag_number,
    event_type: 'Insemination',
    event_date: insDate2,
    sire_info: 'BULL-JERSEY-200',
    outcome: 'Pending'
  });

  // ----------------------------------------------------
  // TEST 1: Farm-Level Insights Execution
  // ----------------------------------------------------
  const insights = await cattleBreedingAnalysisService.getFarmBreedingInsights();
  assert(
    insights !== null && insights.summary !== undefined,
    'getFarmBreedingInsights returns valid aggregate result structure'
  );

  // ----------------------------------------------------
  // TEST 2: Summary Totals
  // ----------------------------------------------------
  assert(
    insights.summary.hasData === true,
    'Farm hasData is true when records exist'
  );
  assert(
    insights.summary.confirmedPregnancies >= 1,
    'Correctly identifies confirmed pregnancies count',
    `Confirmed: ${insights.summary.confirmedPregnancies}`
  );
  assert(
    insights.summary.totalBreedingRecords === store.breedingRecords.length,
    'Total breeding records matches store count',
    `Records: ${insights.summary.totalBreedingRecords}`
  );

  // ----------------------------------------------------
  // TEST 3: Pregnancy Overview Breakdown
  // ----------------------------------------------------
  assert(
    insights.pregnancyOverview.confirmed >= 1,
    'Pregnancy overview confirmed count is accurate'
  );
  assert(
    insights.pregnancyOverview.unconfirmed >= 1,
    'Pregnancy overview unconfirmed count is accurate'
  );

  // ----------------------------------------------------
  // TEST 4: Upcoming Estimated Deliveries Queue
  // ----------------------------------------------------
  assert(
    insights.upcomingDeliveries.length >= 1,
    'Upcoming deliveries queue includes confirmed gestating cattle',
    `Count: ${insights.upcomingDeliveries.length}`
  );
  if (insights.upcomingDeliveries.length > 0) {
    const first = insights.upcomingDeliveries[0];
    assert(
      first.estimatedDeliveryDate !== undefined && first.daysRemaining > 0,
      'Upcoming delivery item contains valid date and days remaining',
      `Target: ${first.estimatedDeliveryDate}, Days left: ${first.daysRemaining}`
    );
  }

  // ----------------------------------------------------
  // TEST 5: Data Quality Completeness Calculation
  // ----------------------------------------------------
  assert(
    insights.dataQuality.qualityScorePercentage >= 0 && insights.dataQuality.qualityScorePercentage <= 100,
    'Data quality completeness score is bounded [0, 100]',
    `QualityScore: ${insights.dataQuality.qualityScorePercentage}%`
  );

  // ----------------------------------------------------
  // TEST 6: Cattle Requiring Attention
  // ----------------------------------------------------
  assert(
    insights.attentionRequired.some(a => a.cattleId === cow2.id || a.issue.includes('pending') || a.issue.includes('confirmation')),
    'Identifies cattle with pending pregnancy checks > 35 days in attention list'
  );

  // ----------------------------------------------------
  // TEST 7: Performance Metrics
  // ----------------------------------------------------
  assert(
    insights.performanceMetrics.hasSufficientData === true,
    'Performance metrics reports sufficient data when >= 2 records exist'
  );
  assert(
    insights.performanceMetrics.pregnancyConfirmationRate !== null,
    'Calculates non-null record-based pregnancy confirmation rate',
    `Rate: ${insights.performanceMetrics.pregnancyConfirmationRate}%`
  );

  // ----------------------------------------------------
  // TEST 8: Dynamic Factual Insights Text
  // ----------------------------------------------------
  assert(
    insights.insights.length > 0 && insights.insights.some(i => i.includes('confirmed') || i.includes('delivery')),
    'Generates dynamic factual summary sentences from real farm data'
  );

  // ----------------------------------------------------
  // TEST 9: Decision-Support Disclaimer
  // ----------------------------------------------------
  assert(
    insights.disclaimer.toLowerCase().includes('decision-support tool'),
    'Includes clinical non-diagnostic decision-support disclaimer'
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase10CTests().catch((err) => {
  console.error('Phase 10C test execution failed:', err);
  process.exit(1);
});
