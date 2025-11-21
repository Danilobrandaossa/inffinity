import { Router } from 'express';
import { mercadoPagoController } from '../controllers/mercado-pago.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post(
  '/payments/:paymentType/:paymentId/checkout',
  authenticate,
  mercadoPagoController.createCheckout.bind(mercadoPagoController),
);

router.post('/webhook', mercadoPagoController.webhook.bind(mercadoPagoController));
router.get('/webhook', mercadoPagoController.webhook.bind(mercadoPagoController));

export default router;


