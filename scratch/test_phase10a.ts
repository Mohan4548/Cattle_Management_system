import { store } from '../backend/src/services/store.js';
import { cattleBreedingAnalysisService } from '../backend/src/services/cattleBreedingAnalysisService.js';

async function runPhase10ATests() {
  console.log('====================================================');
  console.log('FARMEASE PHASE 10A: AI BREEDING ANALYSIS FOUNDATION TEST');
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

  // ----------------------------------------------------
  // TEST 1: Cattle without breeding data
  // ----------------------------------------------------
  const unbredCattle = {
    id: 'test-unbred-1',
    tag_number: 'FE-UNBRED-01',
    name: 'Lakshmi',
    breed: 'Gir',
    gender: 'female',
    date_of_birth: '2023-05-10',
    weight_kg: 380,
    health_status: 'healthy',
    lactation_stage: 'heifer',
    created_at: new Date().toISOString()
  };
  store.cattle.push(unbredCattle);

  const unbredInsight = await cattleBreedingAnalysisService.getBreedingInsight(unbredCattle.id);
  assert(
    unbredInsight.breedingStatus === 'NOT_BRED',
    'Unbred cattle defaults to NOT_BRED status',
    `Status: ${unbredInsight.breedingStatus}`
  );
  assert(
    unbredInsight.pregnancyStatus === 'NOT_PREGNANT',
    'Unbred cattle reports NOT_PREGNANT status',
    `PregnancyStatus: ${unbredInsight.pregnancyStatus}`
  );
  assert(
    unbredInsight.insights.some(i => i.includes('No active breeding')),
    'Factual insight notes indicate no active breeding'
  );

  // ----------------------------------------------------
  // TEST 2: Cattle with insemination but unconfirmed pregnancy
  // ----------------------------------------------------
  const inseminatedCattle = {
    id: 'test-inseminated-2',
    tag_number: 'FE-INS-02',
    name: 'Ganga',
    breed: 'Holstein Friesian',
    gender: 'female',
    date_of_birth: '2021-02-14',
    weight_kg: 520,
    health_status: 'healthy',
    lactation_stage: 'early',
    created_at: new Date().toISOString()
  };
  store.cattle.push(inseminatedCattle);

  const insDateStr = '2026-08-01';
  store.breedingRecords.unshift({
    id: 'br-ins-1',
    cattle_id: inseminatedCattle.id,
    cattle_tag: inseminatedCattle.tag_number,
    cattle_name: inseminatedCattle.name,
    event_type: 'Insemination',
    event_date: insDateStr,
    sire_info: 'BULL-JERSEY-900',
    outcome: 'Pending'
  });

  const insInsight = await cattleBreedingAnalysisService.getBreedingInsight(inseminatedCattle.id);
  assert(
    insInsight.breedingStatus === 'INSEMINATED',
    'Inseminated cattle status is INSEMINATED',
    `Status: ${insInsight.breedingStatus}`
  );
  assert(
    insInsight.pregnancyStatus === 'UNCONFIRMED',
    'Unconfirmed insemination correctly reports UNCONFIRMED pregnancy status',
    `PregnancyStatus: ${insInsight.pregnancyStatus}`
  );
  assert(
    insInsight.insights.some(i => i.includes('Pregnancy confirmation not recorded')),
    'Factual notes state "Pregnancy confirmation not recorded."'
  );

  // ----------------------------------------------------
  // TEST 3: Cattle with confirmed pregnancy & delivery estimation
  // ----------------------------------------------------
  inseminatedCattle.health_status = 'pregnant';
  store.breedingRecords.unshift({
    id: 'br-check-1',
    cattle_id: inseminatedCattle.id,
    cattle_tag: inseminatedCattle.tag_number,
    cattle_name: inseminatedCattle.name,
    event_type: 'Pregnancy Check',
    event_date: '2026-09-01',
    pregnancy_confirmed: true,
    outcome: 'Successful',
    notes: 'Ultrasound confirmed positive'
  });

  const pregInsight = await cattleBreedingAnalysisService.getBreedingInsight(inseminatedCattle.id);
  assert(
    pregInsight.breedingStatus === 'PREGNANT',
    'Confirmed pregnancy status is PREGNANT',
    `Status: ${pregInsight.breedingStatus}`
  );
  assert(
    pregInsight.pregnancyStatus === 'CONFIRMED',
    'Pregnancy status reports CONFIRMED',
    `PregnancyStatus: ${pregInsight.pregnancyStatus}`
  );
  assert(
    !!pregInsight.estimatedDeliveryDate,
    'Estimated delivery date calculated from bovine 283-day gestation',
    `Delivery Date: ${pregInsight.estimatedDeliveryDate}`
  );
  assert(
    !!pregInsight.estimatedDeliveryWindow?.start && !!pregInsight.estimatedDeliveryWindow?.end,
    'Expected delivery window defined with start and end bounds',
    `Window: ${pregInsight.estimatedDeliveryWindow?.start} to ${pregInsight.estimatedDeliveryWindow?.end}`
  );
  assert(
    pregInsight.pregnancyDetails.isPregnant === true && (pregInsight.pregnancyDetails.progressPercentage || 0) > 0,
    'Pregnancy details compute progress percentage and trimester',
    `Trimester: ${pregInsight.pregnancyDetails.trimester}, Progress: ${pregInsight.pregnancyDetails.progressPercentage}%`
  );

  // ----------------------------------------------------
  // TEST 4: Cattle with completed delivery
  // ----------------------------------------------------
  store.breedingRecords.unshift({
    id: 'br-calv-1',
    cattle_id: inseminatedCattle.id,
    cattle_tag: inseminatedCattle.tag_number,
    cattle_name: inseminatedCattle.name,
    event_type: 'Calving',
    event_date: '2026-09-15',
    actual_calving_date: '2026-09-15',
    outcome: 'Successful',
    calf_id: 'calf-999'
  });

  const delivInsight = await cattleBreedingAnalysisService.getBreedingInsight(inseminatedCattle.id);
  assert(
    delivInsight.breedingStatus === 'DELIVERED',
    'Completed calving reports DELIVERED breeding status',
    `Status: ${delivInsight.breedingStatus}`
  );

  // ----------------------------------------------------
  // TEST 5: Determinism Check
  // ----------------------------------------------------
  const secondRun = await cattleBreedingAnalysisService.getBreedingInsight(inseminatedCattle.id);
  assert(
    delivInsight.breedingStatus === secondRun.breedingStatus &&
    delivInsight.breedingHistory.totalBreedingEvents === secondRun.breedingHistory.totalBreedingEvents,
    'Deterministic breeding analysis (identical input yields identical insight)'
  );

  // ----------------------------------------------------
  // TEST 6: Invalid & Non-existent Cattle ID handling
  // ----------------------------------------------------
  let emptyThrew = false;
  try {
    await cattleBreedingAnalysisService.getBreedingInsight('');
  } catch (e: any) {
    emptyThrew = e.message === 'INVALID_CATTLE_ID';
  }
  assert(emptyThrew, 'Empty cattle ID throws INVALID_CATTLE_ID error safely');

  let notFoundThrew = false;
  try {
    await cattleBreedingAnalysisService.getBreedingInsight('non-existent-cattle-999');
  } catch (e: any) {
    notFoundThrew = e.message === 'CATTLE_NOT_FOUND';
  }
  assert(notFoundThrew, 'Non-existent cattle ID throws CATTLE_NOT_FOUND error safely');

  // ----------------------------------------------------
  // TEST 7: Safety Disclaimer Verification
  // ----------------------------------------------------
  assert(
    pregInsight.disclaimer.includes('Decision-support tool') && pregInsight.disclaimer.includes('veterinary diagnosis'),
    'Safety disclaimer present in response',
    pregInsight.disclaimer
  );

  // Cleanup test cattle & records
  store.cattle = store.cattle.filter((c: any) => c.id !== unbredCattle.id && c.id !== inseminatedCattle.id);
  store.breedingRecords = store.breedingRecords.filter(
    (b: any) => b.cattle_id !== unbredCattle.id && b.cattle_id !== inseminatedCattle.id
  );

  console.log('\n====================================================');
  console.log(`PHASE 10A TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED CLEANLY`);
  console.log('====================================================');
}

runPhase10ATests().catch(err => {
  console.error('Fatal error during Phase 10A testing:', err);
  process.exit(1);
});
