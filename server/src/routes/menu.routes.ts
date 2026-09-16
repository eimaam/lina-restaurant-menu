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

// ── Admin & Developer Protected Routes ──
router.post('/categories', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), createCategory);
router.put('/categories/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), updateCategory);
router.delete('/categories/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), deleteCategory);

router.post('/items', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), createMenuItem);
router.put('/items/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), updateMenuItem);
router.delete('/items/:id', authenticate, requireRole([UserRole.Admin, UserRole.Developer]), deleteMenuItem);

export default router;
