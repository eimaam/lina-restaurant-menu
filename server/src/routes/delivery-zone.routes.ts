import { Router } from 'express';
import {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
} from '../controllers/delivery-zone.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Public: Fetch delivery zones for checkout
router.get('/', getDeliveryZones);

// Admin & Developer: Manage delivery zones
router.post('/', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), createDeliveryZone);
router.put('/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), updateDeliveryZone);
router.delete('/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), deleteDeliveryZone);

export default router;
