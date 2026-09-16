import { Router } from 'express';
import { visitsController } from '../controllers/visitsController';

const router = Router();

// GET /api/visits - Obtener estadísticas de visitas y usuarios activos
router.get('/', (req, res) => visitsController.getStats(req, res));

// POST /api/visits/track - Registrar una nueva visita
router.post('/track', (req, res) => visitsController.trackVisit(req, res));

// POST /api/visits/heartbeat - Heartbeat de usuario activo (5 min)
router.post('/heartbeat', (req, res) => visitsController.heartbeat(req, res));

export default router;
