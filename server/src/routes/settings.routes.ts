import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Public: Get restaurant contacts & settings
router.get('/', getSettings);

// Admin & Developer: Update restaurant contacts & settings
router.put('/', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), updateSettings);

export default router;
