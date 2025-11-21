import { Router } from 'express';
import { MasterDashboardController } from '../controllers/dashboard.controller';
import { authenticateMaster } from '../middleware/auth';

const router = Router();
const dashboardController = new MasterDashboardController();

// Todas as rotas requerem autenticação master
router.use(authenticateMaster);

// Rotas do dashboard
router.get('/stats', dashboardController.getDashboardStats.bind(dashboardController));
router.get('/overview', dashboardController.getSystemOverview.bind(dashboardController));
router.get('/activity', dashboardController.getRecentActivity.bind(dashboardController));
router.get('/health', dashboardController.getSystemHealth.bind(dashboardController));

export default router;





