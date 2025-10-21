import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas para analytics (apenas admins)
router.get('/dashboard', authorize('ADMIN'), analyticsController.getDashboard.bind(analyticsController));
router.get('/general-stats', authorize('ADMIN'), analyticsController.getGeneralStats.bind(analyticsController));
router.get('/bookings-by-month', authorize('ADMIN'), analyticsController.getBookingsByMonth.bind(analyticsController));
router.get('/bookings-by-vessel', authorize('ADMIN'), analyticsController.getBookingsByVessel.bind(analyticsController));
router.get('/payment-status', authorize('ADMIN'), analyticsController.getPaymentStatus.bind(analyticsController));
router.get('/revenue-by-month', authorize('ADMIN'), analyticsController.getRevenueByMonth.bind(analyticsController));
router.get('/users-by-status', authorize('ADMIN'), analyticsController.getUsersByStatus.bind(analyticsController));
router.get('/recent-activity', authorize('ADMIN'), analyticsController.getRecentActivity.bind(analyticsController));
router.get('/vessel-usage-stats', authorize('ADMIN'), analyticsController.getVesselUsageStats.bind(analyticsController));

export default router;
