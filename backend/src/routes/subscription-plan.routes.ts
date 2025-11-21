import { Router } from 'express';
import { SubscriptionPlanController } from '../controllers/subscription-plan.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const controller = new SubscriptionPlanController();

router.use(authenticate);

router.get('/', controller.list.bind(controller));
router.post('/', isAdmin, controller.create.bind(controller));

export default router;



