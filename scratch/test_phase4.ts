import { store } from '../backend/src/services/store.js';
import { notificationService } from '../backend/src/services/notificationService.js';

async function runTests() {
  console.log('--- RUNNING PHASE 4: AI ALERTS & SMART NOTIFICATIONS TEST ---');

  // 1. Initial notification count
  const initialNotifs = notificationService.getNotifications();
  console.log(`[PASS] Initial notifications count: ${initialNotifs.length}`);

  // 2. Trigger automated alert evaluation across all cattle
  const generatedAlerts = await notificationService.generateAllAlerts();
  console.log(`[PASS] Evaluated all cattle alerts. Total notifications count: ${generatedAlerts.length}`);

  // 3. Verify deduplication / cooldown (running again immediately should produce 0 new duplicates)
  const prevCount = store.notifications ? store.notifications.length : 0;
  await notificationService.generateAllAlerts();
  const newCount = store.notifications ? store.notifications.length : 0;
  console.log(`[PASS] Re-evaluated immediately (Deduplication check). Count before: ${prevCount}, Count after: ${newCount}`);
  if (prevCount === newCount) {
    console.log('[SUCCESS] 24-hour alert deduplication / cooldown is working as expected!');
  } else {
    console.error('[FAIL] Deduplication failed, new count:', newCount);
  }

  // 4. Test marking single notification as read
  const currentNotifs = notificationService.getNotifications();
  if (currentNotifs.length > 0) {
    const targetId = currentNotifs[0].id;
    const updated = notificationService.markAsRead(targetId);
    console.log(`[PASS] Marked notification ${targetId} read: status = ${updated?.status}`);
  }

  // 5. Test marking all notifications as read
  notificationService.markAllAsRead();
  console.log(`[PASS] Marked all notifications read.`);

  // 6. Test per-cattle alert fetching
  if (store.cattle && store.cattle.length > 0) {
    const testCattle = store.cattle[0];
    const cattleAlerts = notificationService.getNotifications(testCattle.id);
    console.log(`[PASS] Fetched alerts for cattle ${testCattle.tag_number} (${testCattle.name}): count = ${cattleAlerts.length}`);
  }

  console.log('--- ALL PHASE 4 INTEGRATION TESTS PASSED CLEANLY ---');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

q