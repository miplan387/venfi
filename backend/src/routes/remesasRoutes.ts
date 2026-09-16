import { Router } from 'express';
import { remesasController } from '../controllers/remesasController';

const router = Router();

router.get('/', (req, res) => remesasController.getRemesas(req, res));

export default router;
