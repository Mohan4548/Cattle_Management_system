import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as cattleController from '../controllers/cattleController.js';
import * as milkController from '../controllers/milkController.js';
import * as healthController from '../controllers/healthController.js';
import * as breedingController from '../controllers/breedingController.js';
import * as inventoryController from '../controllers/inventoryController.js';
import * as financialsController from '../controllers/financialsController.js';
import * as tasksController from '../controllers/tasksController.js';
import * as usersController from '../controllers/usersController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import * as digitalIdentityController from '../controllers/digitalIdentityController.js';
import * as cattleHealthRiskController from '../controllers/cattleHealthRiskController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as cattleBreedingAnalysisController from '../controllers/cattleBreedingAnalysisController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/forgot-password', authController.forgotPassword);

// Protected Auth Routes
router.get('/auth/me', authenticateToken, authController.getCurrentUser);

// Dashboard Aggregated Analytics Route
router.get('/dashboard/stats', authenticateToken, dashboardController.getDashboardStats);
router.post('/dashboard/activity', authenticateToken, dashboardController.logActivity);

// Cattle Routes
router.get('/cattle', authenticateToken, cattleController.getCattle);
router.get('/cattle/:id/health-risk', authenticateToken, cattleHealthRiskController.getHealthRisk);
router.get('/cattle/:id', authenticateToken, cattleController.getCattleById);

router.post('/cattle', authenticateToken, requireRole(['admin', 'farmer']), cattleController.createCattle);
router.put('/cattle/:id', authenticateToken, requireRole(['admin', 'farmer', 'veterinarian']), cattleController.updateCattle);
router.delete('/cattle/:id', authenticateToken, requireRole(['admin']), cattleController.deleteCattle);

// Comprehensive Milk Production Routes
router.get('/milk', authenticateToken, milkController.getMilkLogs);
router.get('/milk/stats', authenticateToken, milkController.getMilkStats);
router.post('/milk', authenticateToken, requireRole(['admin', 'farmer', 'worker']), milkController.createMilkLog);

// Feed & Nutrition Module Routes
router.get('/feed', authenticateToken, milkController.getFeedLogs);
router.post('/feed', authenticateToken, requireRole(['admin', 'farmer', 'worker']), milkController.createFeedLog);

// Health Routes
router.get('/health/ai-insights', authenticateToken, cattleHealthRiskController.getAIHealthInsights);
router.get('/health', authenticateToken, healthController.getHealthRecords);
router.post('/health', authenticateToken, requireRole(['admin', 'farmer', 'veterinarian']), healthController.createHealthRecord);
router.get('/vaccinations', authenticateToken, healthController.getVaccinations);
router.post('/vaccinations', authenticateToken, requireRole(['admin', 'veterinarian']), healthController.createVaccination);
router.get('/health/deworming', authenticateToken, healthController.getDeworming);
router.post('/health/deworming', authenticateToken, requireRole(['admin', 'farmer', 'veterinarian']), healthController.createDeworming);
router.get('/health/vitamins', authenticateToken, healthController.getVitamins);
router.post('/health/vitamins', authenticateToken, requireRole(['admin', 'farmer', 'veterinarian']), healthController.createVitamin);
router.get('/health/doctor-visits', authenticateToken, healthController.getDoctorVisits);
router.post('/health/doctor-visits', authenticateToken, requireRole(['admin', 'veterinarian']), healthController.createDoctorVisit);
router.get('/health/vitals-trend', authenticateToken, healthController.getVitalsTrend);

// Comprehensive Breeding & Calving Routes
router.get('/breeding', authenticateToken, breedingController.getBreedingRecords);
router.post('/breeding', authenticateToken, requireRole(['admin', 'farmer', 'veterinarian']), breedingController.createBreedingRecord);
router.post('/breeding/register-calf', authenticateToken, requireRole(['admin', 'farmer', 'veterinarian']), breedingController.registerCalf);
router.get('/cattle/:id/breeding-insights', authenticateToken, cattleBreedingAnalysisController.getBreedingInsight);
router.get('/farm/breeding-insights', authenticateToken, cattleBreedingAnalysisController.getFarmBreedingInsights);

// Feed & Inventory Routes
router.get('/inventory', authenticateToken, inventoryController.getInventory);
router.post('/inventory', authenticateToken, requireRole(['admin', 'farmer']), inventoryController.createInventoryItem);
router.patch('/inventory/:id/quantity', authenticateToken, requireRole(['admin', 'farmer', 'worker']), inventoryController.updateInventoryQuantity);

// Financials Routes
router.get('/financials', authenticateToken, requireRole(['admin', 'farmer']), financialsController.getTransactions);
router.get('/financials/summary', authenticateToken, requireRole(['admin', 'farmer']), financialsController.getFinancialSummary);
router.post('/financials', authenticateToken, requireRole(['admin', 'farmer']), financialsController.createTransaction);

// Task Management & Attendance Routes
router.get('/tasks', authenticateToken, tasksController.getTasks);
router.post('/tasks', authenticateToken, requireRole(['admin', 'farmer']), tasksController.createTask);
router.patch('/tasks/:id/status', authenticateToken, tasksController.updateTaskStatus);
router.get('/tasks/attendance', authenticateToken, tasksController.getAttendance);
// Smart Notification & AI Health Alert Routes
router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.post('/notifications/generate', authenticateToken, notificationController.generateAlerts);
router.post('/notifications/mark-all-read', authenticateToken, notificationController.markAllAsRead);
router.patch('/notifications/:id/read', authenticateToken, notificationController.markAsRead);
router.get('/cattle/:id/alerts', authenticateToken, notificationController.getCattleAlerts);

// Purchase Document Routes
router.get('/cattle/:id/purchase-documents', authenticateToken, cattleController.getPurchaseDocuments);
router.post('/cattle/:id/purchase-documents', authenticateToken, requireRole(['admin', 'farmer']), cattleController.addPurchaseDocument);
router.delete('/cattle/:id/purchase-documents/:docId', authenticateToken, requireRole(['admin', 'farmer']), cattleController.deletePurchaseDocument);

// Ownership History Routes
router.get('/cattle/:id/ownership-history', authenticateToken, cattleController.getOwnershipHistory);
router.post('/cattle/:id/ownership-history', authenticateToken, requireRole(['admin', 'farmer']), cattleController.addOwnershipRecord);

// Purchase Analytics
router.get('/purchases/analytics', authenticateToken, cattleController.getPurchaseAnalytics);
// User Administration & System Audit Routes
router.get('/users', authenticateToken, requireRole(['admin']), usersController.getUsers);
router.patch('/users/:id', authenticateToken, requireRole(['admin']), usersController.updateUserRole);
router.get('/users/audit-logs', authenticateToken, requireRole(['admin']), usersController.getAuditLogs);

// ─── Phase 1: Digital Identity Routes ───────────────────────────────────────────────────────
//
// NOTE: Routes with static segments (all, validate, migrate, qr) MUST be registered
// BEFORE the dynamic /:cattleId route to avoid Express matching them as IDs.

// Admin: Get all digital identities (paginated list)
router.get('/identity/all', authenticateToken, requireRole(['admin', 'farmer']), digitalIdentityController.getAllIdentities);

// Validate a Digital Identity ID string
router.get('/identity/validate/:digitalIdentityId', authenticateToken, digitalIdentityController.validateIdentity);

// [Phase 3] Resolve a public_profile_slug to identity (used by QR Scanner)
router.get('/identity/slug/:slug', authenticateToken, digitalIdentityController.getIdentityBySlug);

// Admin: Bulk migrate all cattle without a Digital Identity
router.post('/identity/migrate', authenticateToken, requireRole(['admin']), digitalIdentityController.migrateAllIdentities);

// ─── Phase 2: QR Code Generation Routes ───────────────────────────────────────────────

// Admin: Bulk generate QR codes for all cattle missing QR
router.post('/identity/qr/bulk-generate', authenticateToken, requireRole(['admin']), digitalIdentityController.bulkGenerateQR);

// Get Digital Identity for a specific cattle (by cattle id or tag_id)
router.get('/identity/:cattleId', authenticateToken, digitalIdentityController.getIdentityByCattleId);

// Create / ensure a Digital Identity exists (idempotent)
router.post('/identity/:cattleId', authenticateToken, requireRole(['admin', 'farmer']), digitalIdentityController.createOrEnsureIdentity);

// Update Digital Identity metadata (e.g., qr_status)
router.put('/identity/:cattleId', authenticateToken, requireRole(['admin', 'farmer']), digitalIdentityController.updateIdentity);

// Regenerate identity metadata (reset timestamps, keep permanent Digital ID) - Phase 1
router.post('/identity/:cattleId/regenerate', authenticateToken, requireRole(['admin']), digitalIdentityController.regenerateIdentity);

// [Phase 2] Generate QR for a specific cattle (idempotent)
router.post('/identity/:cattleId/qr', authenticateToken, requireRole(['admin', 'farmer']), digitalIdentityController.generateQR);

// [Phase 2] Admin: regenerate QR (increments version, same payload)
router.post('/identity/:cattleId/qr/regenerate', authenticateToken, requireRole(['admin']), digitalIdentityController.regenerateQR);

export default router;
