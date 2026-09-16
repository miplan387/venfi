import { Router } from 'express';
import authRoutes from './authRoutes';
import rankingRoutes from './rankingRoutes';
import paymentRoutes from './paymentRoutes';
import ratesRoutes from './ratesRoutes';
import userRoutes from './userRoutes';
import weatherRoutes from './weatherRoutes';
import remesasRoutes from './remesasRoutes';
import adminRoutes from './adminRoutes';
import visitsRoutes from './visitsRoutes';
import paymentMethodsRoutes from './paymentMethodsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ranking', rankingRoutes);
router.use('/payments', paymentRoutes);
router.use('/rates', ratesRoutes);
router.use('/user', userRoutes);
router.use('/weather', weatherRoutes);
router.use('/remesas', remesasRoutes);
router.use('/admin', adminRoutes);
router.use('/visits', visitsRoutes);
router.use('/payment-methods', paymentMethodsRoutes);
router.use('/payments/methods', paymentMethodsRoutes);




// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Venfi Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
