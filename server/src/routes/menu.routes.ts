import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem,
} from '../controllers/menu.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// ── Public Routes ──
router.get('/categories', getCategories);
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById);

// ── Staff & Admin Protected Routes ──
// Staff can toggle availability
router.patch('/items/:id/toggle-availability', authenticate, toggleItemAvailability);

// ── Admin Only Protected Routes ──
router.post('/categories', authenticate, requireRole([UserRole.Admin]), createCategory);
router.put('/categories/:id', authenticate, requireRole([UserRole.Admin]), updateCategory);
router.delete('/categories/:id', authenticate, requireRole([UserRole.Admin]), deleteCategory);

router.post('/items', authenticate, requireRole([UserRole.Admin]), createMenuItem);
router.put('/items/:id', authenticate, requireRole([UserRole.Admin]), updateMenuItem);
router.delete('/items/:id', authenticate, requireRole([UserRole.Admin]), deleteMenuItem);

export default router;
