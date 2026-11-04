import { Router } from 'express';
import { zonesController } from '../controllers/zonesController';

const router = Router();

// GET /api/zones - Lista de zonas geográficas
router.get('/', (req, res) => {
  zonesController.getZones(req, res);
});

// GET /api/zones/:key/pricing - Precios de la zona especificada
router.get('/:key/pricing', (req, res) => {
  zonesController.getZonePricing(req, res);
});

export default router;

