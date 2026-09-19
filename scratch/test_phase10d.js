import { notificationService } from '../backend/dist/services/notificationService.js';
import { cattleBreedingAnalysisService } from '../backend/dist/services/cattleBreedingAnalysisService.js';
import { store } from '../backend/dist/services/store.js';

async function runPhase10DVerification() {
  console.log('=== PHASE 10D VERIFICATION START ===');

  console.log(`Initial total cattle count: ${store.cattle.length}`);
  console.log(`Initial notifications count: ${(store.notifications || []).length}`);

  // 1. Test generateAllAlerts including breeding alerts
  const alerts = await notificationService.generateAllAlerts();
  console.log(`Total notifications after generateAllAlerts(): ${alerts.length}`);

  const breedingAlerts = alerts.filter(n =>
    n.type === 'delivery_approaching' ||
    n.type === 'delivery_due_soon' ||
    n.type === 'delivery_date_passed' ||
    n.type === 'pregnancy_followup_due' ||
    n.type === 'missing_pregnancy_confirmation' ||
    n.type === 'breeding_record_incomplete'
  );

  console.log(`Total smart breeding & pregnancy alerts generated: ${breedingAlerts.length}`);
  breedingAlerts.forEach((b, i) => {
    console.log(`\nAlert #${i + 1}:`);
    console.log(`  ID: ${b.id}`);
    console.log(`  Cattle: ${b.cattle_name} (${b.cattle_tag})`);
    console.log(`  Type: ${b.type}`);
    console.log(`  Priority: ${b.priority}`);
    console.log(`  Title: ${b.title}`);
    console.log(`  Description: ${b.description}`);
    console.log(`  Action URL: ${b.action_url}`);
  });

  // 2. Test Smart Deduplication
  console.log('\n--- Testing Smart Deduplication ---');
  const initialAlertsCount = store.notifications.length;
  await notificationService.generateAllAlerts();
  const countAfterSecondCall = store.notifications.length;
  console.log(`Alert count on 1st call: ${initialAlertsCount}, 2nd call: ${countAfterSecondCall}`);
  if (initialAlertsCount === countAfterSecondCall) {
    console.log('SUCCESS: Deduplication prevented duplicate notification creation on subsequent call!');
  } else {
    console.warn(`WARNING: Deduplication check added ${countAfterSecondCall - initialAlertsCount} duplicates.`);
  }

  // 3. Test Delivered Cattle Resolution Logic
  console.log('\n--- Testing Delivered Cattle Resolution ---');
  const kaveri = store.cattle.find(c => c.name === 'Kaveri');
  if (kaveri) {
    store.breedingRecords.push({
      id: 'breed-test-calving',
      cattle_id: kaveri.id,
      event_type: 'Calving',
      actual_calving_date: new Date().toISOString().split('T')[0],
      outcome: 'Successful',
      calf_gender: 'female',
      calf_id: 'calf-test-99',
    });
    console.log(`Added calving record for ${kaveri.name}`);

    await notificationService.generateAllAlerts();
    const kaveriNotifications = store.notifications.filter(n => n.cattle_id === kaveri.id);
    console.log(`Kaveri notifications after calving record added:`);
    kaveriNotifications.forEach(n => {
      console.log(`  ${n.type} -> status: ${n.status}`);
    });
  }

  console.log('\n=== PHASE 10D VERIFICATION COMPLETE ===');
}

runPhase10DVerification().catch(console.error);
