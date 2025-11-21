import { Router } from 'express';
import { SystemSettingsController } from '../controllers/system-settings.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const systemSettingsController = new SystemSettingsController();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas específicas do OneSignal (apenas admin)
router.get('/onesignal', isAdmin, systemSettingsController.getOneSignalConfig.bind(systemSettingsController));
router.put('/onesignal', isAdmin, systemSettingsController.setOneSignalConfig.bind(systemSettingsController));

// Rotas gerais (apenas admin)
router.get('/', isAdmin, systemSettingsController.getAll.bind(systemSettingsController));
router.get('/category/:category', isAdmin, systemSettingsController.getByCategory.bind(systemSettingsController));
router.get('/:key', isAdmin, systemSettingsController.get.bind(systemSettingsController));
router.put('/', isAdmin, systemSettingsController.set.bind(systemSettingsController));

export default router;

