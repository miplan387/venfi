import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';

const router = Router();

router.get('/', (req, res) => weatherController.getWeather(req, res));
router.get('/cities', (req, res) => weatherController.getMajorCities(req, res));

export default router;
