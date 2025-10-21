import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rota para alterar própria senha
router.post('/change-password', userController.changePassword.bind(userController));

// Rotas apenas para Admin
router.post('/', isAdmin, userController.create.bind(userController));
router.get('/', isAdmin, userController.findAll.bind(userController));
router.get('/:id', isAdmin, userController.findById.bind(userController));
router.put('/:id', isAdmin, userController.update.bind(userController));
router.delete('/:id', isAdmin, userController.delete.bind(userController));

export default router;



