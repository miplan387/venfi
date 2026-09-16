import { Router } from 'express';
import { ratesController } from '../controllers/ratesController';

const router = Router();

router.get('/', (req, res) => ratesController.getRates(req, res));
router.get('/history', (req, res) => ratesController.getHistory(req, res));
router.get('/history/:type', (req, res) => ratesController.getHistory(req, res));

export default router;
