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

// Admin & Developer Only (Staff is strictly restricted)
router.post('/', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), createBanner);
router.put('/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), updateBanner);
router.patch('/:id/toggle-active', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), toggleBannerActive);
router.delete('/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), deleteBanner);

export default router;
