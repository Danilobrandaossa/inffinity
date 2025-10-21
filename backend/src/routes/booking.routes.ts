import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const bookingController = new BookingController();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas acessíveis para usuários autenticados
router.post('/', bookingController.create.bind(bookingController));
router.get('/', bookingController.findAll.bind(bookingController));
router.get('/:id', bookingController.findById.bind(bookingController));
router.get('/calendar/:vesselId', bookingController.getCalendar.bind(bookingController));
router.post('/:id/cancel', bookingController.cancel.bind(bookingController));

// Rotas apenas para Admin
router.put('/:id/status', isAdmin, bookingController.updateStatus.bind(bookingController));
router.delete('/:id', isAdmin, bookingController.delete.bind(bookingController));

export default router;



