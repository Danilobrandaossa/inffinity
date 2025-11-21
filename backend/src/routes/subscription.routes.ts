import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const controller = new SubscriptionController();

router.use(authenticate);

router.post('/', controller.create.bind(controller));
router.get('/my', controller.listMine.bind(controller));
router.get('/', isAdmin, controller.listAll.bind(controller));
router.post('/:id/reissue', controller.reissue.bind(controller));

export default router;


