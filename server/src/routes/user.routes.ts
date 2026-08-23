import { Router } from 'express';
import {
  getUsers,
  createUser,
  resetPassword,
  toggleUserStatus,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// All user management routes are Admin Only
router.use(authenticate, requireRole([UserRole.Admin]));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/reset-password', resetPassword);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
