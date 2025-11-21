import { Router } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import { authenticateMaster, requireMasterRole } from '../middleware/auth';

const router = Router();
const integrationController = new IntegrationController();

// Todas as rotas requerem autenticação master
router.use(authenticateMaster);

// Rotas de usuários do sistema principal
router.get('/users', integrationController.getMainSystemUsers.bind(integrationController));
router.post('/users', requireMasterRole(['MASTER_OWNER', 'MASTER_SUPPORT']), integrationController.createMainSystemUser.bind(integrationController));
router.put('/users/:userId', requireMasterRole(['MASTER_OWNER', 'MASTER_SUPPORT']), integrationController.updateMainSystemUser.bind(integrationController));
router.post('/users/:userId/suspend', requireMasterRole(['MASTER_OWNER', 'MASTER_SUPPORT']), integrationController.suspendMainSystemUser.bind(integrationController));
router.post('/users/:userId/activate', requireMasterRole(['MASTER_OWNER', 'MASTER_SUPPORT']), integrationController.activateMainSystemUser.bind(integrationController));

// Rotas de embarcações do sistema principal
router.get('/vessels', integrationController.getMainSystemVessels.bind(integrationController));

// Rotas de reservas do sistema principal
router.get('/bookings', integrationController.getMainSystemBookings.bind(integrationController));

// Rotas de auditoria do sistema principal
router.get('/audit', integrationController.getMainSystemAuditLogs.bind(integrationController));

// Status dos sistemas
router.get('/status', integrationController.getSystemStatus.bind(integrationController));

export default router;





