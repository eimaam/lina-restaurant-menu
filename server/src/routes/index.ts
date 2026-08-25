import { Router } from 'express';
import authRoutes from './auth.routes';
import menuRoutes from './menu.routes';
import bannerRoutes from './banner.routes';
import orderRoutes from './order.routes';
import userRoutes from './user.routes';
import deliveryZoneRoutes from './delivery-zone.routes';
import settingsRoutes from './settings.routes';
import auditLogRoutes from './audit-log.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/banners', bannerRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/delivery-zones', deliveryZoneRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-logs', auditLogRoutes);

export default router;
