import { Router } from 'express';
import * as goldController from '../controllers/goldController';

const router = Router();

// GET /api/market/gold
router.get('/gold', goldController.getGoldPrice);

// GET /api/market/oro (alias en español)
router.get('/oro', goldController.getGoldPrice);

// GET /api/gold (si se monta en la raíz de gold)
router.get('/', goldController.getGoldPrice);

export default router;
