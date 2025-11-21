import { Router } from 'express';
import { MasterTenantsController } from '../controllers/tenants.controller';
import { 
  authenticateMaster, 
  requireMasterRole, 
  requireImpersonatePermission 
} from '../middleware/auth';

const router = Router();
const masterTenantsController = new MasterTenantsController();

// Todas as rotas requerem autenticação master
router.use(authenticateMaster);

// Rotas de gestão de tenants
router.get('/', masterTenantsController.getTenants.bind(masterTenantsController));
router.get('/:id', masterTenantsController.getTenantById.bind(masterTenantsController));
router.post('/', requireMasterRole(['MASTER_OWNER']), masterTenantsController.createTenant.bind(masterTenantsController));
router.put('/:id', requireMasterRole(['MASTER_OWNER', 'MASTER_SUPPORT']), masterTenantsController.updateTenant.bind(masterTenantsController));
router.delete('/:id', requireMasterRole(['MASTER_OWNER']), masterTenantsController.deleteTenant.bind(masterTenantsController));

// Rotas de controle de status
router.post('/:id/suspend', requireMasterRole(['MASTER_OWNER', 'MASTER_SUPPORT']), masterTenantsController.suspendTenant.bind(masterTenantsController));
router.post('/:id/activate', requireMasterRole(['MASTER_OWNER', 'MASTER_SUPPORT']), masterTenantsController.activateTenant.bind(masterTenantsController));

// Rotas de impersonate
router.post('/:tenantId/impersonate', requireImpersonatePermission, masterTenantsController.impersonateTenant.bind(masterTenantsController));
router.post('/impersonate/:impersonationId/stop', requireImpersonatePermission, masterTenantsController.stopImpersonate.bind(masterTenantsController));

export default router;








