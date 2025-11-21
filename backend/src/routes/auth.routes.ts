import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rate-limiter';

const router = Router();
const authController = new AuthController();

// Login sem rate limiter muito restritivo (nginx já faz isso)
// Se necessário, usar rate limiter mais permissivo
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

export default router;



