import { cattleBreedingAnalysisService } from '../backend/src/services/cattleBreedingAnalysisService.js';
import { notificationService } from '../backend/src/services/notificationService.js';
import { store } from '../backend/src/services/store.js';

async function runPhase10ETesting() {
  console.log('=== PHASE 10E COMPREHENSIVE TEST SUITE START ===');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? `: ${detail}` : ''}`);
      failedTests++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Single Source of Truth for Gestation Assumption
  // -------------------------------------------------------------
  console.log('\n--- 1. Gestation Assumption Validation ---');
  try {
    const insight = await cattleBreedingAnalysisService.getBreedingInsight('cattle-1');
    assert(
      insight.disclaimer.includes('AI Breeding Insight & Pregnancy Timeline'),
      'Breeding Insight returns proper decision-support disclaimer'
    );
  } catch (e: any) {
    assert(false, 'Gestation Assumption Validation', e.message);
  }

  // -------------------------------------------------------------
  // Test 2: Incomplete & Missing Cattle Data / Edge Cases
  // -------------------------------------------------------------
  console.log('\n--- 2. Edge Cases & Missing Data ---');
  
  // Nonexistent cattle ID
  try {
    await cattleBreedingAnalysisService.getBreedingInsight('non-existent-id-999');
    assert(false, 'Nonexistent cattle ID handling', 'Expected CATTLE_NOT_FOUND error');
  } catch (e: any) {
    assert(e.message === 'CATTLE_NOT_FOUND', 'Nonexistent cattle ID throws CATTLE_NOT_FOUND error');
  }

  // Empty string / invalid cattle ID
  try {
    await cattleBreedingAnalysisService.getBreedingInsight('');
    assert(false, 'Empty cattle ID handling', 'Expected INVALID_CATTLE_ID error');
  } catch (e: any) {
    assert(e.message === 'INVALID_CATTLE_ID', 'Empty cattle ID throws INVALID_CATTLE_ID error');
  }

  // Male Cattle Analysis
  const maleCattle = store.cattle.find((c: any) => c.gender === 'male');
  if (maleCattle) {
    try {
      const maleInsight = await cattleBreedingAnalysisService.getBreedingInsight(maleCattle.id);
      assert(
        maleInsight.missingData.some(m => m.includes('male')),
        'Male cattle identifies gender restriction rule in missingData'
      );
    } catch (e: any) {
      assert(false, 'Male cattle analysis', e.message);
    }
  }

  // Cattle with NO breeding records
  const newCow: any = {
    id: 'test-cow-no-records',
    tag_number: 'TEST-TAG-001',
    name: 'Test Cow Without Records',
    breed: 'Gir',
    gender: 'female',
    date_of_birth: '2022-01-01',
    health_status: 'healthy',
  };
  store.cattle.push(newCow);

  try {
    const noRecordInsight = await cattleBreedingAnalysisService.getBreedingInsight(newCow.id);
    assert(
      noRecordInsight.pregnancyStatus === 'NOT_PREGNANT',
      'Cattle without breeding records has pregnancyStatus NOT_PREGNANT'
    );
    assert(
      noRecordInsight.breedingStatus === 'NOT_BRED',
      'Cattle without breeding records has breedingStatus NOT_BRED'
    );
    assert(
      noRecordInsight.pregnancyDetails.isPregnant === false,
      'Cattle without breeding records is NOT reported as pregnant'
    );
  } catch (e: any) {
    assert(false, 'No breeding records analysis', e.message);
  }

  // -------------------------------------------------------------
  // Test 3: End-to-End Breeding & Calving Cycle Workflow
  // -------------------------------------------------------------
  console.log('\n--- 3. End-to-End Workflow Test ---');
  
  const testCow: any = {
    id: 'test-cow-e2e',
    tag_number: 'TEST-TAG-E2E',
    name: 'E2E Test Cow',
    breed: 'Holstein Friesian',
    gender: 'female',
    date_of_birth: '2021-05-10',
    health_status: 'healthy',
  };
  store.cattle.push(testCow);

  // Step A: Insemination Logged
  store.breedingRecords.push({
    id: 'br-e2e-ins',
    cattle_id: testCow.id,
    event_type: 'Insemination',
    event_date: '2026-01-01',
    sire_info: 'BULL-E2E',
    outcome: 'Pending',
  });

  let e2eInsight = await cattleBreedingAnalysisService.getBreedingInsight(testCow.id);
  assert(
    e2eInsight.pregnancyStatus === 'UNCONFIRMED',
    'Stage 1: Inseminated cow has UNCONFIRMED pregnancy status'
  );
  assert(
    e2eInsight.breedingStatus === 'INSEMINATED',
    'Stage 1: Inseminated cow has INSEMINATED breeding status'
  );

  // Step B: Pregnancy Confirmed
  store.breedingRecords.push({
    id: 'br-e2e-check',
    cattle_id: testCow.id,
    event_type: 'Pregnancy Check',
    event_date: '2026-02-15',
    pregnancy_confirmed: true,
    outcome: 'Successful',
  });
  testCow.health_status = 'pregnant';

  e2eInsight = await cattleBreedingAnalysisService.getBreedingInsight(testCow.id);
  assert(
    e2eInsight.pregnancyStatus === 'CONFIRMED',
    'Stage 2: Pregnancy check confirms CONFIRMED pregnancy status'
  );
  assert(
    e2eInsight.breedingStatus === 'PREGNANT',
    'Stage 2: Pregnancy check confirms PREGNANT breeding status'
  );
  assert(
    !!e2eInsight.estimatedDeliveryDate,
    'Stage 2: Confirmed pregnancy has valid estimated delivery date'
  );

  // Step C: Calving / Delivery Logged
  const calvingDate = '2026-10-10';
  store.breedingRecords.push({
    id: 'br-e2e-calving',
    cattle_id: testCow.id,
    event_type: 'Calving',
    actual_calving_date: calvingDate,
    outcome: 'Successful',
  });
  testCow.health_status = 'healthy';

  e2eInsight = await cattleBreedingAnalysisService.getBreedingInsight(testCow.id);
  assert(
    e2eInsight.pregnancyStatus === 'DELIVERED',
    'Stage 3: Calving record updates pregnancy status to DELIVERED'
  );
  assert(
    e2eInsight.breedingStatus === 'DELIVERED',
    'Stage 3: Calving record updates breeding status to DELIVERED'
  );

  // -------------------------------------------------------------
  // Test 4: Deduplication in Smart Notifications
  // -------------------------------------------------------------
  console.log('\n--- 4. Notification Deduplication Testing ---');
  
  const notifsCall1 = await notificationService.generateAllAlerts();
  const count1 = notifsCall1.length;

  const notifsCall2 = await notificationService.generateAllAlerts();
  const count2 = notifsCall2.length;

  assert(
    count1 === count2,
    `Notification deduplication works (Call 1: ${count1}, Call 2: ${count2})`
  );

  // Clean test cattle from store
  store.cattle = store.cattle.filter((c: any) => c.id !== 'test-cow-no-records' && c.id !== 'test-cow-e2e');
  store.breedingRecords = store.breedingRecords.filter((b: any) => b.cattle_id !== 'test-cow-e2e');

  console.log(`\n=== TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED ===`);
}

runPhase10ETesting().catch(console.error);
