import { store } from './store.js';
import { cattleHealthRiskService } from './cattleHealthRiskService.js';
import {
  SmartNotification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  HealthRiskLevel
} from '../types/index.js';

export class NotificationService {
  /**
   * Deduplication check: Prevents creating duplicate alerts for identical cattle condition within a 24h window
   */
  private hasRecentDuplicateAlert(
    cattleId: string,
    type: NotificationType,
    riskLevel?: HealthRiskLevel
  ): boolean {
    const notifications: SmartNotification[] = store.notifications || [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    return notifications.some(n => 
      n.cattle_id === cattleId &&
      n.type === type &&
      (!riskLevel || n.risk_level === riskLevel) &&
      n.created_at >= oneDayAgo &&
      n.status !== 'resolved'
    );
  }

  /**
   * Evaluates AI Health Risk alerts for all cattle
   */
  public async evaluateAIHealthAlerts(): Promise<SmartNotification[]> {
    const allCattle = store.cattle || [];
    const newAlerts: SmartNotification[] = [];

    for (const cattle of allCattle) {
      try {
        const riskRes = await cattleHealthRiskService.getHealthRisk(cattle.id);
        const mainFactorObj = riskRes.keyFactors[0];

        // A. High Risk Alert
        if (riskRes.riskLevel === 'HIGH') {
          if (!this.hasRecentDuplicateAlert(cattle.id, 'ai_health_risk', 'HIGH')) {
            const notif: SmartNotification = {
              id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              cattle_id: cattle.id,
              cattle_name: cattle.name,
              cattle_tag: cattle.tag_number || cattle.tag_id || 'FE-UNKNOWN',
              type: 'ai_health_risk',
              priority: 'high',
              title: `Health Attention Required: ${cattle.name}`,
              description: `AI Health Risk: HIGH (Score: ${riskRes.riskScore}/100). Main factor: ${mainFactorObj?.factor || 'Active medical signals'}. Recommended veterinary review.`,
              risk_level: 'HIGH',
              risk_score: riskRes.riskScore,
              main_factor: mainFactorObj?.factor || 'Abnormal physiological parameters',
              recommended_action: riskRes.recommendations[0] || 'Schedule immediate veterinary assessment.',
              status: 'unread',
              action_url: `/cattle/${cattle.id}`,
              created_at: new Date().toISOString()
            };
            newAlerts.push(notif);
          }
        }
        // B. Medium Risk Alert
        else if (riskRes.riskLevel === 'MEDIUM') {
          if (!this.hasRecentDuplicateAlert(cattle.id, 'ai_health_risk', 'MEDIUM')) {
            const notif: SmartNotification = {
              id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              cattle_id: cattle.id,
              cattle_name: cattle.name,
              cattle_tag: cattle.tag_number || cattle.tag_id || 'FE-UNKNOWN',
              type: 'ai_health_risk',
              priority: 'medium',
              title: `Health Watch Flagged: ${cattle.name}`,
              description: `AI Health Risk: MEDIUM (Score: ${riskRes.riskScore}/100). Main factor: ${mainFactorObj?.factor || 'Moderate concern'}. Monitor closely.`,
              risk_level: 'MEDIUM',
              risk_score: riskRes.riskScore,
              main_factor: mainFactorObj?.factor || 'Moderate health parameters',
              recommended_action: riskRes.recommendations[0] || 'Increase vitals monitoring frequency.',
              status: 'unread',
              action_url: `/cattle/${cattle.id}`,
              created_at: new Date().toISOString()
            };
            newAlerts.push(notif);
          }
        }
      } catch (err) {
        // Silently skip cattle evaluation if missing mandatory data
      }
    }

    return newAlerts;
  }

  /**
   * Evaluates Vaccination Due & Overdue alerts
   */
  public evaluateVaccinationAlerts(): SmartNotification[] {
    const vaccinations = store.vaccinations || [];
    const todayStr = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newAlerts: SmartNotification[] = [];

    for (const vac of vaccinations) {
      if (!vac.next_due_date) continue;

      const cattle = store.cattle.find((c: any) => c.id === vac.cattle_id);
      const cattleName = cattle?.name || vac.cattle_name || 'Cattle';
      const cattleTag = cattle?.tag_number || vac.cattle_tag || 'FE-UNKNOWN';

      // Overdue
      if (vac.next_due_date < todayStr) {
        if (!this.hasRecentDuplicateAlert(vac.cattle_id, 'vaccination_overdue')) {
          newAlerts.push({
            id: `notif-vac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            cattle_id: vac.cattle_id,
            cattle_name: cattleName,
            cattle_tag: cattleTag,
            type: 'vaccination_overdue',
            priority: 'high',
            title: `Vaccination Overdue: ${cattleName}`,
            description: `Vaccine: ${vac.vaccine_name}. Due date was ${vac.next_due_date}. Please review vaccination records.`,
            recommended_action: `Administer ${vac.vaccine_name} protocol as soon as possible.`,
            status: 'unread',
            action_url: `/cattle/${vac.cattle_id}`,
            created_at: new Date().toISOString()
          });
        }
      }
      // Due soon (next 30 days)
      else if (vac.next_due_date >= todayStr && vac.next_due_date <= in30Days) {
        if (!this.hasRecentDuplicateAlert(vac.cattle_id, 'vaccination_due')) {
          newAlerts.push({
            id: `notif-vac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            cattle_id: vac.cattle_id,
            cattle_name: cattleName,
            cattle_tag: cattleTag,
            type: 'vaccination_due',
            priority: 'medium',
            title: `Vaccination Due Soon: ${cattleName}`,
            description: `Vaccine: ${vac.vaccine_name} is scheduled for ${vac.next_due_date}.`,
            recommended_action: `Prepare ${vac.vaccine_name} dosage before ${vac.next_due_date}.`,
            status: 'unread',
            action_url: `/cattle/${vac.cattle_id}`,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return newAlerts;
  }

  /**
   * Evaluates Treatment Follow-up alerts
   */
  public evaluateTreatmentAlerts(): SmartNotification[] {
    const healthRecords = store.healthRecords || [];
    const newAlerts: SmartNotification[] = [];

    for (const h of healthRecords) {
      if (h.status === 'active' || h.is_emergency) {
        const cattle = store.cattle.find((c: any) => c.id === h.cattle_id);
        const cattleName = cattle?.name || h.cattle_name || 'Cattle';

        if (!this.hasRecentDuplicateAlert(h.cattle_id, 'treatment_followup')) {
          newAlerts.push({
            id: `notif-trt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            cattle_id: h.cattle_id,
            cattle_name: cattleName,
            cattle_tag: cattle?.tag_number || h.cattle_tag || 'FE-UNKNOWN',
            type: 'treatment_followup',
            priority: h.is_emergency ? 'high' : 'medium',
            title: `Treatment Follow-up Due: ${cattleName}`,
            description: `Active diagnosis: '${h.diagnosis}'. Please review treatment and clinical recovery status.`,
            recommended_action: 'Re-examine vitals and verify medication response.',
            status: 'unread',
            action_url: `/cattle/${h.cattle_id}`,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return newAlerts;
  }

  /**
   * Evaluates Repeated Health Concern alerts based on historical records
   */
  public evaluateRepeatedHealthConcernAlerts(): SmartNotification[] {
    const healthRecords = store.healthRecords || [];
    const newAlerts: SmartNotification[] = [];

    const recordsByCattle: Record<string, any[]> = {};
    for (const h of healthRecords) {
      if (!recordsByCattle[h.cattle_id]) recordsByCattle[h.cattle_id] = [];
      recordsByCattle[h.cattle_id].push(h);
    }

    for (const cattleId in recordsByCattle) {
      const records = recordsByCattle[cattleId];
      if (records.length >= 2) {
        const cattle = store.cattle.find((c: any) => c.id === cattleId);
        if (cattle && !this.hasRecentDuplicateAlert(cattleId, 'repeated_health_concern')) {
          newAlerts.push({
            id: `notif-rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            cattle_id: cattleId,
            cattle_name: cattle.name,
            cattle_tag: cattle.tag_number || cattle.tag_id || 'FE-UNKNOWN',
            type: 'repeated_health_concern',
            priority: 'high',
            title: `Repeated Health Concerns: ${cattle.name}`,
            description: `${cattle.name} has ${records.length} recent health records logged. Pattern requires veterinary review.`,
            recommended_action: 'Review complete health timeline with consulting veterinarian.',
            status: 'unread',
            action_url: `/cattle/${cattleId}`,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return newAlerts;
  }

  /**
   * Main evaluator: Runs deduplicated alert generation across all rules
   */
  public async generateAllAlerts(): Promise<SmartNotification[]> {
    if (!store.notifications) {
      store.notifications = [];
    }

    const aiAlerts = await this.evaluateAIHealthAlerts();
    const vacAlerts = this.evaluateVaccinationAlerts();
    const trtAlerts = this.evaluateTreatmentAlerts();
    const repAlerts = this.evaluateRepeatedHealthConcernAlerts();

    const allNew = [...aiAlerts, ...vacAlerts, ...trtAlerts, ...repAlerts];

    // Push new alerts to store
    for (const notif of allNew) {
      store.notifications.unshift(notif);
    }

    return store.notifications;
  }

  /**
   * Retrieve notifications with optional filters
   */
  public getNotifications(cattleId?: string, status?: string): SmartNotification[] {
    if (!store.notifications || store.notifications.length === 0) {
      // Auto-trigger initial evaluation if empty
      this.generateAllAlerts();
    }

    let list: SmartNotification[] = store.notifications || [];

    if (cattleId) {
      list = list.filter(n => n.cattle_id === cattleId);
    }
    if (status) {
      list = list.filter(n => n.status === status);
    }

    return list;
  }

  /**
   * Mark a single notification read
   */
  public markAsRead(id: string): SmartNotification | null {
    const notif = (store.notifications || []).find((n: SmartNotification) => n.id === id);
    if (notif) {
      notif.status = 'read';
      return notif;
    }
    return null;
  }

  /**
   * Mark all notifications read
   */
  public markAllAsRead(): void {
    if (store.notifications) {
      store.notifications.forEach((n: SmartNotification) => {
        if (n.status === 'unread') n.status = 'read';
      });
    }
  }
}

export const notificationService = new NotificationService();
