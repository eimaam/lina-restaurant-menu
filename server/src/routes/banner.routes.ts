import { Router } from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  toggleBannerActive,
  deleteBanner,
} from '../controllers/banner.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Public
router.get('/', getBanners);

// Admin Only
router.post('/', authenticate, requireRole([UserRole.Admin]), createBanner);
router.put('/:id', authenticate, requireRole([UserRole.Admin]), updateBanner);
router.patch('/:id/toggle-active', authenticate, requireRole([UserRole.Admin]), toggleBannerActive);
router.delete('/:id', authenticate, requireRole([UserRole.Admin]), deleteBanner);

export default router;
