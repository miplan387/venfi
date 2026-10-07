import { Router } from 'express';
import { remesasController } from '../controllers/remesasController';
import { optionalAuthMiddleware as authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin as adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// 1. Obtener comparativa en tiempo real (Público)
router.get('/', (req, res) => remesasController.getRemesas(req, res));

// 2. Listar todos los proveedores / casas de cambio (Admin)
router.get('/providers', authMiddleware, adminMiddleware, (req: any, res) => remesasController.getAllProviders(req, res));

// 3. Obtener un proveedor específico por key (Público / Admin)
router.get('/providers/:key', (req, res) => remesasController.getProviderByKey(req, res));

// 4. Crear nuevo proveedor (Admin)
router.post('/providers', authMiddleware, adminMiddleware, (req: any, res) => remesasController.createProvider(req, res));

// 5. Actualizar proveedor existente (Admin)
router.put('/providers/:key', authMiddleware, adminMiddleware, (req: any, res) => remesasController.updateProvider(req, res));

// 6. Alternar estado activo / inactivo (Admin)
router.patch('/providers/:key/toggle', authMiddleware, adminMiddleware, (req: any, res) => remesasController.toggleProviderActive(req, res));

// 7. Eliminar proveedor (Admin)
router.delete('/providers/:key', authMiddleware, adminMiddleware, (req: any, res) => remesasController.deleteProvider(req, res));

export default router;
