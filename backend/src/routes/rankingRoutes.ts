import { Router } from 'express';
import { rankingController } from '../controllers/rankingController';
import { validateRequest } from '../middleware/validate';
import { clickTrackSchema } from '../schemas/paymentSchemas';

const router = Router();

router.get('/', (req, res) => rankingController.getRanking(req, res));
router.post('/click/:position', validateRequest(clickTrackSchema), (req, res) => rankingController.trackClick(req, res));

export default router;
