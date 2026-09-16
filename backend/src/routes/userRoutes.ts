import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Endpoints del Dashboard de Anunciante
router.get('/dashboard', optionalAuthMiddleware, (req, res) => dashboardController.getSummary(req, res));
router.get('/dashboard/clicks', optionalAuthMiddleware, (req, res) => dashboardController.getClicks(req, res));
router.get('/dashboard/geolocation', optionalAuthMiddleware, (req, res) => dashboardController.getGeolocation(req, res));
router.get('/dashboard/campaigns', optionalAuthMiddleware, (req, res) => dashboardController.getCampaigns(req, res));
router.get('/dashboard/payments', optionalAuthMiddleware, (req, res) => dashboardController.getPayments(req, res));
router.get('/notifications', optionalAuthMiddleware, (req, res) => dashboardController.getNotifications(req, res));

export default router;
