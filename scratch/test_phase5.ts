import { store } from '../backend/src/services/store.js';
import { cattleHealthRiskService } from '../backend/src/services/cattleHealthRiskService.js';
import { notificationService } from '../backend/src/services/notificationService.js';

async function runPhase5Tests() {
  console.log('====================================================');
  console.log('FARMEASE PHASE 5: PRODUCTION READINESS & TESTING');
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
  // TEST 1: Newly registered cattle (no vitals/records)
  // ----------------------------------------------------
  const newCattle = {
    id: 'test-new-cattle-99',
    tag_number: 'FE-NEW-999',
    name: 'Gauri',
    breed: 'Sahiwal',
    gender: 'female',
    date_of_birth: '2022-01-01',
    weight_kg: 350,
    health_status: 'healthy',
    lactation_stage: 'early',
    image_url: 'https://example.com/cow.jpg',
    created_at: new Date().toISOString()
  };
  store.cattle.push(newCattle);

  const newRisk = await cattleHealthRiskService.getHealthRisk(newCattle.id);
  assert(
    newRisk.riskScore >= 0 && newRisk.riskScore <= 100,
    'Newly registered cattle score within 0-100 bound',
    `Score: ${newRisk.riskScore}`
  );
  assert(
    newRisk.riskLevel === 'LOW',
    'Newly registered cattle defaults to LOW risk level',
    `Level: ${newRisk.riskLevel}`
  );
  assert(
    newRisk.confidence === 'LOW' || newRisk.confidence === 'MEDIUM',
    'Newly registered cattle reports appropriate data confidence',
    `Confidence: ${newRisk.confidence}`
  );

  // ----------------------------------------------------
  // TEST 2: Deterministic result check
  // ----------------------------------------------------
  const secondRisk = await cattleHealthRiskService.getHealthRisk(newCattle.id);
  assert(
    newRisk.riskScore === secondRisk.riskScore && newRisk.riskLevel === secondRisk.riskLevel,
    'Deterministic health risk calculation (identical input produces identical result)',
    `Run 1: ${newRisk.riskScore}, Run 2: ${secondRisk.riskScore}`
  );

  // ----------------------------------------------------
  // TEST 3: Abnormal vitals evaluation (Fever & High HR)
  // ----------------------------------------------------
  store.healthRecords.unshift({
    id: 'rec-test-abnormal-1',
    cattle_id: newCattle.id,
    record_type: 'Disease',
    diagnosis: 'Suspected Fever',
    body_temp_c: 40.2,
    heart_rate_bpm: 95,
    is_emergency: true,
    status: 'active',
    cost: 500,
    record_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  });

  const abnormalRisk = await cattleHealthRiskService.getHealthRisk(newCattle.id);
  assert(
    abnormalRisk.riskLevel === 'HIGH',
    'Abnormal vitals & emergency correctly trigger HIGH risk level',
    `Score: ${abnormalRisk.riskScore}, Level: ${abnormalRisk.riskLevel}`
  );
  assert(
    abnormalRisk.keyFactors.some(f => f.impact === 'High'),
    'Key explainable factors contain High Impact tags for abnormal vitals'
  );

  // ----------------------------------------------------
  // TEST 4: Invalid numeric vitals sanitization (out-of-bounds)
  // ----------------------------------------------------
  const dirtyData = cattleHealthRiskService.collectHealthData(newCattle.id);
  dirtyData.bodyTempC = 999.9; // absurd temperature
  dirtyData.heartRateBpm = -50; // absurd heart rate
  cattleHealthRiskService.validateHealthData(dirtyData);
  assert(
    dirtyData.bodyTempC === null && dirtyData.heartRateBpm === null,
    'Out-of-bounds numeric vitals sanitized to null safely'
  );

  // ----------------------------------------------------
  // TEST 5: Non-existent & Invalid Cattle ID Handling
  // ----------------------------------------------------
  let emptyIdThrew = false;
  try {
    await cattleHealthRiskService.getHealthRisk('');
  } catch (e: any) {
    emptyIdThrew = e.message === 'INVALID_CATTLE_ID';
  }
  assert(emptyIdThrew, 'Empty cattle ID throws INVALID_CATTLE_ID error safely');

  let invalidIdThrew = false;
  try {
    await cattleHealthRiskService.getHealthRisk('non-existent-cattle-id-xyz');
  } catch (e: any) {
    invalidIdThrew = e.message === 'CATTLE_NOT_FOUND';
  }
  assert(invalidIdThrew, 'Non-existent cattle ID throws CATTLE_NOT_FOUND error safely');

  // ----------------------------------------------------
  // TEST 6: Safety disclaimer & decision-support wording
  // ----------------------------------------------------
  assert(
    abnormalRisk.safetyNotice.includes('Decision-support') && abnormalRisk.safetyNotice.includes('Veterinary Review'),
    'Safety disclaimer present in response',
    abnormalRisk.safetyNotice
  );
  assert(
    abnormalRisk.recommendations.every(r => !r.includes('cure') && !r.includes('guarantee')),
    'Recommendations enforce decision-support safety wording'
  );

  // ----------------------------------------------------
  // TEST 7: AI Insights Aggregation Completeness
  // ----------------------------------------------------
  const insights = await cattleHealthRiskService.getAIHealthInsights();
  const sumOfRiskLevels = insights.lowRiskCount + insights.mediumRiskCount + insights.highRiskCount;
  assert(
    sumOfRiskLevels === insights.totalAnalyzed,
    'Sum of LOW + MEDIUM + HIGH risk counts equals totalAnalyzed',
    `Total: ${insights.totalAnalyzed}, Sum: ${sumOfRiskLevels}`
  );
  assert(
    insights.healthDataCoverage >= 0 && insights.healthDataCoverage <= 100,
    'Health data coverage percentage bounded 0-100%',
    `Coverage: ${insights.healthDataCoverage}%`
  );

  // ----------------------------------------------------
  // TEST 8: Smart Notifications & 24h Deduplication
  // ----------------------------------------------------
  const initialAlertCount = (store.notifications || []).length;
  await notificationService.generateAllAlerts();
  const alertCountAfterFirstRun = (store.notifications || []).length;
  
  await notificationService.generateAllAlerts();
  const alertCountAfterSecondRun = (store.notifications || []).length;

  assert(
    alertCountAfterSecondRun === alertCountAfterFirstRun,
    '24-hour alert deduplication prevents duplicate notifications on repeated evaluation',
    `First run: ${alertCountAfterFirstRun}, Second run: ${alertCountAfterSecondRun}`
  );

  // ----------------------------------------------------
  // TEST 9: Notification State Toggles (Read & Mark All Read)
  // ----------------------------------------------------
  const unreadNotifs = (store.notifications || []).filter(n => n.status === 'unread');
  if (unreadNotifs.length > 0) {
    const targetNotif = unreadNotifs[0];
    const readItem = notificationService.markAsRead(targetNotif.id);
    assert(readItem?.status === 'read', 'markAsRead updates single notification status to read');
  }

  notificationService.markAllAsRead();
  const remainingUnread = (store.notifications || []).filter(n => n.status === 'unread').length;
  assert(remainingUnread === 0, 'markAllAsRead marks all notifications as read', `Remaining unread: ${remainingUnread}`);

  // Cleanup test cattle
  const idx = store.cattle.findIndex((c: any) => c.id === newCattle.id);
  if (idx !== -1) store.cattle.splice(idx, 1);
  store.healthRecords = store.healthRecords.filter((h: any) => h.cattle_id !== newCattle.id);

  console.log('\n====================================================');
  console.log(`PHASE 5 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED CLEANLY`);
  console.log('====================================================');
}

runPhase5Tests().catch(err => {
  console.error('Fatal error during Phase 5 testing:', err);
  process.exit(1);
});
