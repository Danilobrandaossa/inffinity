import { Router } from 'express';
import { MasterAuthController } from '../controllers/auth.controller';
import { authenticateMaster } from '../middleware/auth';

const router = Router();
const masterAuthController = new MasterAuthController();

// Rotas públicas
router.post('/login', masterAuthController.login.bind(masterAuthController));

// Rotas protegidas
router.use(authenticateMaster);

router.post('/setup-2fa', masterAuthController.setup2FA.bind(masterAuthController));
router.post('/verify-2fa', masterAuthController.verify2FA.bind(masterAuthController));
router.post('/logout', masterAuthController.logout.bind(masterAuthController));
router.get('/profile', masterAuthController.getProfile.bind(masterAuthController));

export default router;








