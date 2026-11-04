import { Router } from 'express';
import { marketController } from '../controllers/marketController';

const router = Router();

// GET /api/market/oil
router.get('/oil', (req, res) => marketController.getOilPrices(req, res));

// GET /api/market/petroleo (alias en español)
router.get('/petroleo', (req, res) => marketController.getOilPrices(req, res));

// GET /api/market/history/:type (Historial y tendencia de oro o petróleo)
router.get('/history/:type', (req, res) => marketController.getCommodityHistory(req, res));

// GET /api/market (ruta raíz del módulo de mercado)
router.get('/', (req, res) => marketController.getOilPrices(req, res));

export default router;
